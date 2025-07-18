import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, cardId, amount, currency, merchant, products } = body;

    // Validate required fields
    if (!accountId || !cardId || !amount || !merchant) {
      return NextResponse.json({
        success: false,
        authorized: false,
        amount: amount || 0,
        currency: currency || 'gbp',
        merchant: merchant?.name || 'Unknown',
        mcc: merchant?.mcc || '0000',
        message: 'Incomplete transaction data',
        reason: 'Missing required fields',
      }, { status: 400 });
    }

    console.log('🎯 Creating test authorization:', {
      accountId,
      cardId,
      amount,
      merchant: merchant.name,
      mcc: merchant.mcc
    });

    // Use Stripe Test Helpers to create a real authorization
    // This will trigger the real-time webhook authorization flow
    try {
      const testAuthorization = await stripe.testHelpers.issuing.authorizations.create({
        card: cardId,
        amount: amount,
        currency: currency || 'gbp',
        merchant_data: {
          category: getMccCategory(merchant.mcc),
          city: merchant.city || 'London',
                      country: 'GB',
          name: merchant.name,
          network_id: `merch_${Date.now()}`,
          postal_code: merchant.postal_code || '75001',
        },
        network_data: {
          acquiring_institution_id: 'acq_123456',
        },
        // Set amount controllable for fuel dispensers and similar
        is_amount_controllable: merchant.mcc === '5542', // Gas stations
      }, {
        stripeAccount: accountId,
      });

      console.log('✅ Test authorization created:', testAuthorization.id);
      console.log('   Status:', testAuthorization.status);
      console.log('   Approved:', testAuthorization.approved);

      // The webhook will handle the real-time authorization decision
      // Return the authorization result
      return NextResponse.json({
        success: true,
        authorized: testAuthorization.approved,
        amount: testAuthorization.amount,
        currency: testAuthorization.currency,
        merchant: testAuthorization.merchant_data.name,
        mcc: merchant.mcc,
        authorizationId: testAuthorization.id,
        status: testAuthorization.status,
        message: testAuthorization.approved 
          ? 'Payment authorized successfully' 
          : getDeclineMessage(testAuthorization, merchant),
        processing_method: 'real_stripe_issuing',
        webhook_processed: true,
      });

    } catch (stripeError: any) {
      console.error('Stripe authorization creation failed:', stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.code === 'card_declined') {
        return NextResponse.json({
          success: true,
          authorized: false,
          amount,
          currency: currency || 'gbp',
          merchant: merchant.name,
          mcc: merchant.mcc,
          message: 'Transaction declined by spending controls',
          reason: stripeError.decline_code || 'spending_controls',
          error_type: 'card_declined'
        });
      }

      if (stripeError.code === 'insufficient_funds') {
        return NextResponse.json({
          success: true,
          authorized: false,
          amount,
          currency: currency || 'gbp',
          merchant: merchant.name,
          mcc: merchant.mcc,
          message: 'Insufficient funds in issuing account',
          reason: 'insufficient_funds',
          error_type: 'insufficient_funds'
        });
      }

      if (stripeError.code === 'card_not_active') {
        return NextResponse.json({
          success: true,
          authorized: false,
          amount,
          currency: currency || 'gbp',
          merchant: merchant.name,
          mcc: merchant.mcc,
          message: 'Card is not active',
          reason: 'card_inactive',
          error_type: 'card_not_active'
        });
      }

      // Fallback to simulation if test helpers fail (for demo purposes)
      console.log('⚠️ Falling back to simulation due to Stripe error');
      return simulateAuthorization(amount, currency || 'gbp', merchant);
    }

  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.json({
      success: false,
      authorized: false,
      amount: 0,
      currency: 'gbp',
      merchant: 'Unknown',
      mcc: '0000',
      message: 'Internal server error',
      reason: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * Get MCC category mapping for Stripe
 */
function getMccCategory(mcc: string): any {
  const mccMappings: Record<string, string> = {
    '5812': 'eating_places_restaurants',
    '4121': 'taxicabs_limousines', 
    '5977': 'cosmetic_stores',
    '5541': 'service_stations',
    '5542': 'automated_fuel_dispensers',
    '5411': 'grocery_stores_supermarkets',
    '5691': 'mens_and_womens_clothing_stores',
    '7372': 'computer_programming_services',
    '5734': 'computer_software_stores',
  };

  return mccMappings[mcc] || 'other';
}

/**
 * Generate decline message based on authorization and merchant
 */
function getDeclineMessage(authorization: any, merchant: any): string {
  // Check if it was declined due to spending controls
  const mccInfo = DEMO_CONFIG.mccCodes[merchant.mcc];
  
  if (mccInfo && !mccInfo.allowed) {
    return `Transaction declined - Category "${mccInfo.name}" blocked by spending controls`;
  }

  // Check spending limits
  const monthlyLimit = 50000; // £500 in cents
  const dailyLimit = 2500;    // £25 in cents
  
  if (authorization.amount > monthlyLimit) {
    return `Transaction declined - Monthly limit exceeded (${formatCurrency(authorization.amount)} > ${formatCurrency(monthlyLimit)})`;
  }
  
  if (authorization.amount > dailyLimit) {
    return `Transaction declined - Daily limit exceeded (${formatCurrency(authorization.amount)} > ${formatCurrency(dailyLimit)})`;
  }

  return 'Transaction declined by spending controls';
}

/**
 * Fallback simulation when Stripe test helpers aren't available
 */
function simulateAuthorization(amount: number, currency: string, merchant: any) {
  // Get MCC information
  const mccInfo = DEMO_CONFIG.mccCodes[merchant.mcc];
  if (!mccInfo) {
    return NextResponse.json({
      success: false,
      authorized: false,
      amount,
      currency,
      merchant: merchant.name,
      mcc: merchant.mcc,
      message: 'Unknown MCC code',
      reason: 'Unknown MCC code',
      processing_method: 'simulation_fallback',
    });
  }

  // Check if MCC is allowed
  const isAllowed = mccInfo.allowed;
  
  if (!isAllowed) {
    return NextResponse.json({
      success: true,
      authorized: false,
      amount,
      currency,
      merchant: merchant.name,
      mcc: merchant.mcc,
      message: 'Transaction declined by spending controls',
      reason: `The category "${mccInfo.name}" is blocked by your spending policy`,
      processing_method: 'simulation_fallback',
    });
  }

  // Check spending limits (demo limits - set higher for demo purposes)
  const monthlyLimit = 500000; // £5000 in cents
  const dailyLimit = 25000;    // £250 in cents
  
  if (amount > monthlyLimit) {
    return NextResponse.json({
      success: true,
      authorized: false,
      amount,
      currency,
      merchant: merchant.name,
      mcc: merchant.mcc,
      message: 'Transaction declined - Monthly limit exceeded',
      reason: `Amount (${formatCurrency(amount)}) exceeds monthly limit of ${formatCurrency(monthlyLimit)}`,
      processing_method: 'simulation_fallback',
    });
  }

  if (amount > dailyLimit) {
    return NextResponse.json({
      success: true,
      authorized: false,
      amount,
      currency,
      merchant: merchant.name,
      mcc: merchant.mcc,
      message: 'Transaction declined - Daily limit exceeded',
      reason: `Amount (${formatCurrency(amount)}) exceeds daily limit of ${formatCurrency(dailyLimit)}`,
      processing_method: 'simulation_fallback',
    });
  }

  // Authorization successful
  const authorizationId = `auth_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return NextResponse.json({
    success: true,
    authorized: true,
    amount,
    currency,
    merchant: merchant.name,
    mcc: merchant.mcc,
    authorizationId,
    message: 'Payment authorized successfully',
    processing_method: 'simulation_fallback',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount / 100);
} 