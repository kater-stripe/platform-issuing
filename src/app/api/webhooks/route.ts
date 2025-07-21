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
    // Verify webhook signature - make secret optional for local testing
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } else {
      console.warn('⚠️ No webhook secret configured - parsing event without verification (development only)');
      // For local development without proper webhook setup
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    console.error('Signature received:', signature);
    console.error('Body length:', body.length);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('📡 Webhook received:', event.type, event.id);

  try {
    // Process relevant webhook events
    const eventData = {
      id: event.id,
      type: event.type,
      created: event.created,
      timestamp: new Date().toISOString(),
      data: event.data.object,
      account: event.account || null,
    };

    // Handle specific event types
    switch (event.type) {
      case 'issuing_authorization.request':
        // CRITICAL: Real-time authorization request - must respond IMMEDIATELY
        console.log('🚨 AUTH REQUEST:', event.data.object.id, `${event.data.object.amount/100} ${event.data.object.currency}`);
        
        // Process authorization in background, respond immediately
        setImmediate(async () => {
          try {
            await handleAuthorizationRequest(event.data.object, event.account);
          } catch (error) {
            console.error('Background auth processing failed:', error);
          }
        });
        
        // Store minimal event data
        (eventData as any).authorization_amount = event.data.object.amount;
        (eventData as any).authorization_merchant = event.data.object.merchant_data?.name;
        break;

      case 'issuing_authorization.created':
        console.log('🔒 Authorization created:', event.data.object.id);
        console.log('   Amount:', event.data.object.amount, event.data.object.currency);
        console.log('   Merchant:', event.data.object.merchant_data?.name);
        console.log('   Status:', event.data.object.status);
        console.log('   Approved:', event.data.object.approved);
        break;

      case 'issuing_authorization.updated':
        console.log('🔄 Authorization updated:', event.data.object.id);
        console.log('   Status:', event.data.object.status);
        console.log('   Amount:', event.data.object.amount);
        break;

      case 'issuing_card.created':
        console.log('💳 Card created:', event.data.object.id);
        console.log('   Last4:', event.data.object.last4);
        console.log('   Cardholder:', event.data.object.cardholder);
        break;

      case 'issuing_cardholder.created':
        console.log('👤 Cardholder created:', event.data.object.id);
        console.log('   Name:', event.data.object.name);
        console.log('   Email:', event.data.object.email);
        break;

      case 'account.updated':
        console.log('🏢 Account updated:', event.data.object.id);
        console.log('   Charges enabled:', event.data.object.charges_enabled);
        console.log('   Details submitted:', event.data.object.details_submitted);
        break;

      case 'balance.available':
        console.log('💰 Balance updated:', event.data.object.available);
        break;

      case 'issuing_transaction.created':
        console.log('💸 Transaction created:', event.data.object.id);
        console.log('   Amount:', event.data.object.amount, event.data.object.currency);
        console.log('   Merchant:', event.data.object.merchant_data?.name);
        break;

      default:
        console.log('📄 Other event:', event.type);
        break;
    }

    // Store event directly using shared storage
    try {
      webhookEventStorage.addEvent(eventData);
    } catch (storageError) {
      console.error('Failed to store webhook event:', storageError);
      // Don't fail the webhook if storage fails
    }

    // Check if this is a relevant event for the demo
    const isRelevantEvent = DEMO_CONFIG.relevantWebhookEvents.includes(event.type);
    
    if (isRelevantEvent) {
      console.log('⭐ Relevant demo event detected:', event.type);
    }

    return NextResponse.json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id,
      relevant: isRelevantEvent
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Handle real-time authorization requests - optimized for speed
 * Processes in background after webhook response is sent
 */
async function handleAuthorizationRequest(authorization: any, stripeAccount?: string) {
  const startTime = Date.now();
  
  try {
    // Quick decision logic - minimize processing
    const amount = authorization.amount;
    const merchantCategory = authorization.merchant_data?.category;

    // Fast approval logic - approve most transactions for demo
    let isBlocked = false;
    let declineReason = '';

    // Simple amount check (higher limits for demo)
    if (amount > 500000) { // £5000
      isBlocked = true;
      declineReason = 'Amount exceeds limit';
    }

    // Quick MCC check
    if (merchantCategory && DEMO_CONFIG.mccCodes[merchantCategory]?.allowed === false) {
      isBlocked = true;
      declineReason = 'Merchant category blocked';
    }

    // Fast API call
    const options = stripeAccount ? { stripeAccount } : {};
    
    if (isBlocked) {
      await stripe.issuing.authorizations.decline(authorization.id, {}, options);
      console.log('❌ DECLINED:', authorization.id, declineReason);
    } else {
      await stripe.issuing.authorizations.approve(authorization.id, {}, options);
      console.log('✅ APPROVED:', authorization.id, `${amount/100} ${authorization.currency}`);
    }

    console.log(`⏱️ Processed in ${Date.now() - startTime}ms`);

    return {
      approved: !isBlocked,
      reason: declineReason,
      amount: amount,
      processing_time: Date.now() - startTime
    };

  } catch (error: any) {
    console.error('❌ Auth failed:', authorization.id, error.message);
    return {
      approved: false,
      reason: 'Internal server error',
      amount: 0,
      processing_time: Date.now() - startTime,
      error: error.message
    };
  }
}



// Handle GET requests for webhook endpoint info
export async function GET() {
  return NextResponse.json({
    message: 'Demo Webhook Endpoint',
    supported_events: DEMO_CONFIG.relevantWebhookEvents,
    status: 'active',
    endpoint: '/api/webhooks',
    events_endpoint: '/api/webhooks/events',
    authorization_logic: 'real-time',
    response_window: '2000ms'
  });
} 