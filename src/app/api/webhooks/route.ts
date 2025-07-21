import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';
import { webhookEventStorage } from '@/lib/webhook-storage';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } else {
      console.warn('⚠️ No webhook secret configured - parsing event without verification');
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('📡 Webhook received:', event.type, event.id);

  try {
    const eventData: any = {
      id: event.id,
      type: event.type,
      created: event.created,
      timestamp: new Date().toISOString(),
      data: event.data.object,
      account: event.account || null,
    };

    if (event.type === 'issuing_authorization.request') {
      const requestStartTime = Date.now();
      const actualAmount = event.data.object.amount || event.data.object.pending_request?.amount || 0;
      
      console.log('🚨 AUTHORIZATION REQUEST:', {
        id: event.data.object.id,
        amount: actualAmount,
        merchant: event.data.object.merchant_data?.name,
      });

      const authorizationResult = await handleAuthorizationRequest(event.data.object, event.account);
      eventData.authorization_decision = authorizationResult;

      const totalProcessingTime = Date.now() - requestStartTime;
      console.log('✅ AUTHORIZATION RESPONSE:', {
        id: event.data.object.id,
        decision: authorizationResult.approved ? 'APPROVED' : 'DECLINED',
        reason: authorizationResult.reason,
        processingTime: totalProcessingTime,
      });
    }

    webhookEventStorage.addEvent(eventData);

    const responseData: any = {
      received: true,
    };

    if (event.type === 'issuing_authorization.request') {
      const authDecision = eventData.authorization_decision;
      responseData.authorization = {
        approved: authDecision.approved,
        amount: authDecision.amount,
        reason: authDecision.reason || undefined,
      };
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error.message,
    }, { status: 500 });
  }
}

function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

async function handleAuthorizationRequest(authorization: any, stripeAccount?: string) {
  const startTime = Date.now();
  
  try {
    const actualAmount = authorization.amount || authorization.pending_request?.amount || 0;
    const merchantCategory = authorization.merchant_data?.category;
    const merchantName = authorization.merchant_data?.name || 'Unknown Merchant';
    const isAmountControllable = authorization.pending_request?.is_amount_controllable || false;
    
    let isBlocked = false;
    let declineReason = '';

    const blockedMerchant = DEMO_CONFIG.merchants.blocked.find(m =>
      m.name.toLowerCase().includes(merchantName.toLowerCase()) ||
      m.mcc === merchantCategory
    );

    if (blockedMerchant) {
      isBlocked = true;
      declineReason = `Merchant "${merchantName}" blocked`;
    } else {
      const mccInfo = DEMO_CONFIG.mccCodes[merchantCategory];
      if (mccInfo && !mccInfo.allowed) {
        isBlocked = true;
        declineReason = `Category "${mccInfo.name}" blocked`;
      }
    }

    const dailyLimit = 25000;
    if (actualAmount > dailyLimit) {
      isBlocked = true;
      declineReason = `Amount exceeds daily limit of ${formatCurrency(dailyLimit)}`;
    }

    return {
      approved: !isBlocked,
      reason: declineReason,
      amount: actualAmount,
      processing_time: Date.now() - startTime,
    };

  } catch (error: any) {
    console.error('❌ Authorization processing failed:', error);
    return {
      approved: false,
      reason: 'Internal server error',
      amount: 0,
      processing_time: Date.now() - startTime,
      error: error.message,
    };
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo Webhook Endpoint',
    supported_events: DEMO_CONFIG.relevantWebhookEvents,
    status: 'active',
    endpoint: '/api/webhooks',
    events_endpoint: '/api/webhooks/events',
    authorization_logic: 'real-time',
    response_window: '2000ms',
  });
} 