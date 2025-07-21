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
        // CRITICAL: Real-time authorization request - must respond within 2 seconds
        const requestStartTime = Date.now();
        console.log('');
        console.log('🚨 ============ AUTHORIZATION REQUEST RECEIVED ============');
        console.log('📨 Event ID:', event.id);
        console.log('🔑 Authorization ID:', event.data.object.id);
        // Get the correct amount (might be in pending_request)
        const actualAmount = event.data.object.amount || event.data.object.pending_request?.amount || 0;
        console.log('💰 Amount:', `${actualAmount / 100} ${event.data.object.currency.toUpperCase()}`);
        console.log('💰 Amount Source:', event.data.object.amount ? 'amount' : 'pending_request.amount');
        console.log('🏪 Merchant:', event.data.object.merchant_data?.name || 'Unknown');
        console.log('📊 MCC:', event.data.object.merchant_data?.category || 'Unknown');
        console.log('💳 Card:', event.data.object.card);
        console.log('👤 Cardholder:', event.data.object.cardholder);
        console.log('🏢 Account:', event.account || 'Unknown');
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('');
        console.log('🔍 DEBUG: Full authorization object:');
        console.log(JSON.stringify(event.data.object, null, 2));
        console.log('');
        console.log('🔍 DEBUG: Amount details:');
        console.log('  - Raw amount:', event.data.object.amount);
        console.log('  - Amount type:', typeof event.data.object.amount);
        console.log('  - Pending request:', event.data.object.pending_request);
        console.log('🚨 ================================================');
        console.log('');
        
        const authorizationResult = await handleAuthorizationRequest(event.data.object, event.account);
        
        // Store the authorization decision (cast to allow additional properties)
        (eventData as any).authorization_decision = authorizationResult;
        
        const totalProcessingTime = Date.now() - requestStartTime;
        console.log('');
        console.log('✅ ============ AUTHORIZATION RESPONSE SENT ============');
        console.log('🔑 Authorization ID:', event.data.object.id);
        console.log('🎯 Decision:', authorizationResult.approved ? '✅ APPROVED' : '❌ DECLINED');
        if (!authorizationResult.approved) {
          console.log('❌ Decline Reason:', authorizationResult.reason);
        }
        console.log('⏱️ Processing Time:', `${totalProcessingTime}ms`);
        console.log('📊 Within 2s Limit:', totalProcessingTime < 2000 ? '✅ YES' : '❌ NO');
        console.log('⏰ Response Timestamp:', new Date().toISOString());
        console.log('✅ ================================================');
        console.log('');
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

    // For authorization requests, include the decision in the response
    const responseData: any = { 
      received: true, 
      eventType: event.type,
      eventId: event.id,
      relevant: isRelevantEvent
    };

    // If this was an authorization request, include the decision
    if (event.type === 'issuing_authorization.request' && (eventData as any).authorization_decision) {
      const authDecision = (eventData as any).authorization_decision;
      responseData.authorization = {
        approved: authDecision.approved,
        amount: authDecision.amount,
        reason: authDecision.reason || undefined
      };
      console.log('📤 Webhook response includes authorization decision:', responseData.authorization);
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

// Utility function for formatting currency
function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Handle real-time authorization requests within 2-second window
 * This is the core authorization logic that replaces the simulation
 */
async function handleAuthorizationRequest(authorization: any, stripeAccount?: string) {
  const startTime = Date.now();
  
  try {
    // Get the correct amount (might be in pending_request)
    const actualAmount = authorization.amount || authorization.pending_request?.amount || 0;
    
    console.log('🔍 Processing authorization request:', {
      id: authorization.id,
      amount: actualAmount,
      amount_source: authorization.amount ? 'amount' : 'pending_request.amount',
      currency: authorization.currency,
      merchant: authorization.merchant_data?.name,
      mcc: authorization.merchant_data?.category,
      card: authorization.card,
      cardholder: authorization.cardholder,
      account: stripeAccount
    });

    // Get MCC from authorization
    const merchantCategory = authorization.merchant_data?.category;
    const merchantName = authorization.merchant_data?.name || 'Unknown Merchant';
    
    // Use the amount we already calculated above
    const amount = actualAmount;
    const currency = authorization.currency;
    
    console.log('💰 Final amount being processed:', `${amount / 100} ${currency.toUpperCase()}`);

    // Check if this is a partial authorization (amount controllable)
    const isAmountControllable = authorization.pending_request?.is_amount_controllable || false;

    // 1. Check MCC restrictions based on demo config
    console.log(`🔍 Checking MCC ${merchantCategory} for merchant "${merchantName}"`);
    
    // First check if merchant is in our blocked list
    const blockedMerchant = DEMO_CONFIG.merchants.blocked.find(m => 
      m.name.toLowerCase().includes(merchantName.toLowerCase()) ||
      m.mcc === merchantCategory
    );
    
    // Then check if merchant is in our allowed list  
    const allowedMerchant = DEMO_CONFIG.merchants.allowed.find(m => 
      m.name.toLowerCase().includes(merchantName.toLowerCase()) ||
      m.mcc === merchantCategory
    );

    let isBlocked = false;
    let declineReason = '';

    if (blockedMerchant) {
      isBlocked = true;
      declineReason = `Merchant "${merchantName}" blocked by spending controls`;
      console.log(`❌ Blocked merchant found: ${blockedMerchant.name}`);
    } else if (allowedMerchant) {
      // Explicitly allowed merchant
      console.log(`✅ Allowed merchant found: ${allowedMerchant.name}`);
    } else if (merchantCategory) {
      // Check if the MCC code itself is blocked in our config
      const mccInfo = DEMO_CONFIG.mccCodes[merchantCategory];
      if (mccInfo && !mccInfo.allowed) {
        isBlocked = true;
        declineReason = `Category "${mccInfo.name}" blocked by spending controls`;
        console.log(`❌ Blocked MCC category: ${mccInfo.name}`);
      } else if (mccInfo && mccInfo.allowed) {
        console.log(`✅ Allowed MCC category: ${mccInfo.name}`);
      } else {
        // Unknown MCC - let's be permissive for demo
        console.log(`⚠️ Unknown MCC ${merchantCategory} - allowing for demo purposes`);
      }
    } else {
      console.log(`⚠️ No MCC provided - allowing for demo purposes`);
    }

    // 2. Check spending limits (demo limits - set higher for demo purposes)
    const monthlyLimit = 500000; // £5000 in cents
    const dailyLimit = 25000;    // £250 in cents
    
    if (amount > monthlyLimit) {
      isBlocked = true;
      declineReason = `Amount (${formatCurrency(amount, currency)}) exceeds monthly limit of ${formatCurrency(monthlyLimit, currency)}`;
    } else if (amount > dailyLimit) {
      isBlocked = true;
      declineReason = `Amount (${formatCurrency(amount, currency)}) exceeds daily limit of ${formatCurrency(dailyLimit, currency)}`;
    }

    // 3. Make authorization decision
    const authorizationDecision = {
      approved: !isBlocked,
      reason: declineReason,
      amount: isAmountControllable && isBlocked ? 0 : amount,
      processing_time: Date.now() - startTime
    };

    // 4. Log authorization decision (no API calls needed for real-time webhooks)
    if (authorizationDecision.approved) {
      console.log('');
      console.log('✅ ======== AUTHORIZATION APPROVED ========');
      console.log('🔑 Authorization ID:', authorization.id);
      console.log('💰 Amount:', `${authorizationDecision.amount / 100} ${currency.toUpperCase()}`);
      console.log('🏪 Merchant:', merchantName);
      console.log('📊 MCC:', merchantCategory);
      console.log('⏰ Decision Time:', new Date().toISOString());
      if (isAmountControllable && authorizationDecision.amount !== amount) {
        console.log('🔄 Partial Amount:', `${authorizationDecision.amount / 100} ${currency.toUpperCase()}`);
      }
      console.log('✅ ======================================');
      console.log('');
    } else {
      console.log('');
      console.log('❌ ======== AUTHORIZATION DECLINED ========');
      console.log('🔑 Authorization ID:', authorization.id);
      console.log('💰 Amount:', `${amount / 100} ${currency.toUpperCase()}`);
      console.log('🏪 Merchant:', merchantName);
      console.log('📊 MCC:', merchantCategory);
      console.log('❌ Decline Reason:', declineReason);
      console.log('⏰ Decision Time:', new Date().toISOString());
      console.log('❌ ======================================');
      console.log('');
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Authorization processed in ${processingTime}ms (must be < 2000ms)`);

    return authorizationDecision;

  } catch (error: any) {
    console.error('❌ Authorization processing failed:', error);
    
    // If we fail to process, let Stripe handle it based on webhook timeout settings
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