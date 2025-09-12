import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';

/**
 * Test Authorization Creation Endpoint
 * Creates test authorizations for different demo scenarios
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId, cardId, scenario, customAmount, customMerchant } = await request.json();

    if (!accountId || !cardId) {
      return NextResponse.json({
        success: false,
        error: 'accountId and cardId are required'
      }, { status: 400 });
    }

    // Predefined SnackPack test scenarios
    const testScenarios = {
      'paul-success': {
        merchant: DEMO_CONFIG.merchants.meal.find(m => m.name.includes('Paul')),
        amount: 1250, // £12.50 - within meal wallet limit
        description: 'Successful meal wallet transaction'
      },
      'uber-success': {
        merchant: DEMO_CONFIG.merchants.transport.find(m => m.name.includes('Uber')),
        amount: 1250, // £12.50 - within transport wallet limit
        description: 'Successful transport wallet transaction'
      },
      'wellness-success': {
        merchant: DEMO_CONFIG.merchants.wellness.find(m => m.name.includes('PureGym')),
        amount: 2999, // £29.99 - within wellness wallet limit
        description: 'Successful wellness wallet transaction (gym membership)'
      },
      'gas-station-blocked': {
        merchant: DEMO_CONFIG.merchants.blocked.find(m => m.mcc === '5541'),
        amount: 6500, // £65.00
        description: 'Blocked gas station transaction (MCC restriction)'
      },
      'high-amount-declined': {
        merchant: DEMO_CONFIG.merchants.meal.find(m => m.name.includes('Paul')),
        amount: 2500, // £25.00 - exceeds meal wallet daily limit of £15
        description: 'Declined meal transaction (daily limit exceeded)'
      },
      'partial-authorization': {
        merchant: {
          name: 'Gas Station',
          mcc: '5542', // Automated fuel dispenser
          city: 'London',
                      postal_code: 'EC1A 1BB'
        },
        amount: 10000, // €100.00 - will be partially authorized
        description: 'Partial authorization scenario (fuel dispenser)'
      }
    };

    let testData;
    
    if (scenario && testScenarios[scenario as keyof typeof testScenarios]) {
      testData = testScenarios[scenario as keyof typeof testScenarios];
    } else if (customMerchant && customAmount) {
      testData = {
        merchant: customMerchant,
        amount: customAmount,
        description: 'Custom test authorization'
      };
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either scenario or customMerchant+customAmount is required',
        availableScenarios: Object.keys(testScenarios)
      }, { status: 400 });
    }

    if (!testData.merchant) {
      return NextResponse.json({
        success: false,
        error: 'Merchant not found for scenario',
        scenario
      }, { status: 400 });
    }

    console.log('🧪 Creating test authorization:', {
      scenario,
      merchant: testData.merchant.name,
      amount: testData.amount,
      description: testData.description
    });

    // Create test authorization using Stripe Test Helpers
    const testAuthorization = await stripe.testHelpers.issuing.authorizations.create({
      card: cardId,
      amount: testData.amount,
      currency: 'gbp',
      merchant_data: {
        category: getMccCategory(testData.merchant.mcc),
        city: testData.merchant.city || 'London',
                  country: 'GB',
        name: testData.merchant.name,
        network_id: `test_merch_${Date.now()}`,
        postal_code: testData.merchant.postal_code || '75001',
      },
      network_data: {
        acquiring_institution_id: 'test_acq_123456',
      },
      is_amount_controllable: testData.merchant.mcc === '5542', // Fuel dispensers allow partial auth
    }, {
      stripeAccount: accountId,
    });

    console.log('✅ Test authorization created:', testAuthorization.id);
    console.log('   Status:', testAuthorization.status);
    console.log('   Approved:', testAuthorization.approved);

    return NextResponse.json({
      success: true,
      scenario,
      description: testData.description,
      authorization: {
        id: testAuthorization.id,
        amount: testAuthorization.amount,
        currency: testAuthorization.currency,
        approved: testAuthorization.approved,
        status: testAuthorization.status,
        merchant_data: testAuthorization.merchant_data,
      },
      expected_outcome: getExpectedOutcome(testData.merchant, testData.amount),
      webhook_triggered: true,
    });

  } catch (error: any) {
    console.error('Test authorization creation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create test authorization',
      details: error.message,
      code: error.code,
    }, { status: 500 });
  }
}

/**
 * Get available test scenarios
 */
export async function GET() {
  const scenarios = {
    'paul-success': {
      name: 'Paul Boulangerie (Success)',
      description: 'Restaurant transaction that should be approved',
      expectedOutcome: 'approved',
      amount: '€12.50'
    },
    'uber-success': {
      name: 'Uber (Success)',
      description: 'Taxi transaction that should be approved',
      expectedOutcome: 'approved',
      amount: '€18.50'
    },
    'sephora-success': {
      name: 'Sephora (Success)',
      description: 'Cosmetics transaction that should be approved',
      expectedOutcome: 'approved',
      amount: '€45.00'
    },
    'gas-station-blocked': {
      name: 'Gas Station (Blocked)',
      description: 'Gas station transaction blocked by MCC controls',
      expectedOutcome: 'declined',
      reason: 'MCC category blocked',
      amount: '€30.00'
    },
    'high-amount-declined': {
      name: 'High Amount (Declined)',
      description: 'Transaction exceeding daily spending limit',
      expectedOutcome: 'declined',
      reason: 'Amount limit exceeded',
      amount: '€75.00'
    },
    'partial-authorization': {
      name: 'Fuel Dispenser (Partial)',
      description: 'Fuel dispenser allowing partial authorization',
      expectedOutcome: 'partial',
      reason: 'Amount controllable',
      amount: '€100.00'
    }
  };

  return NextResponse.json({
    message: 'Test Authorization Scenarios',
    scenarios,
    usage: {
      endpoint: 'POST /api/issuing/test-authorization',
      parameters: {
        accountId: 'Required - Stripe account ID',
        cardId: 'Required - Issuing card ID',
        scenario: 'Optional - One of the predefined scenarios',
        customMerchant: 'Optional - Custom merchant object',
        customAmount: 'Optional - Custom amount in cents'
      }
    }
  });
}

/**
 * Get MCC category for Stripe
 */
function getMccCategory(mcc: string): any {
  const mccMappings: Record<string, string> = {
    '5812': 'eating_places_restaurants',
    '4121': 'taxicabs_limousines', 
    '5977': 'cosmetic_stores',
    '5541': 'service_stations',
    '5542': 'automated_fuel_dispensers',
  };

  return mccMappings[mcc] || 'other';
}

/**
 * Get expected outcome for a transaction
 */
function getExpectedOutcome(merchant: any, amount: number) {
  const mccInfo = DEMO_CONFIG.mccCodes[merchant.mcc];
  
  if (!mccInfo || !mccInfo.allowed) {
    return {
      expected: 'declined',
      reason: 'MCC category blocked by spending controls'
    };
  }

  const dailyLimit = 2500; // €25 in cents
  if (amount > dailyLimit) {
    return {
      expected: 'declined',
      reason: 'Amount exceeds daily spending limit'
    };
  }

  if (merchant.mcc === '5542') {
    return {
      expected: 'partial_authorized',
      reason: 'Fuel dispenser allows partial authorization'
    };
  }

  return {
    expected: 'approved',
    reason: 'Transaction meets all spending controls'
  };
} 