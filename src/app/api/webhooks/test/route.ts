import { NextRequest, NextResponse } from 'next/server';
import { webhookEventStorage } from '@/lib/webhook-storage';

// Test endpoint to manually create webhook events for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType = 'issuing_authorization.created' } = body;

    // Create a mock webhook event
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      timestamp: new Date().toISOString(),
      data: createMockEventData(eventType),
      account: 'acct_test_123',
    };

    // Store the mock event directly using shared storage
    webhookEventStorage.addEvent(mockEvent);

    return NextResponse.json({
      success: true,
      message: `Mock ${eventType} event created successfully`,
      event: mockEvent
    });

  } catch (error: any) {
    console.error('Mock webhook creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create mock webhook event',
      details: error.message
    }, { status: 500 });
  }
}

function createMockEventData(eventType: string) {
  switch (eventType) {
    case 'issuing_authorization.created':
      return {
        id: `iauth_test_${Date.now()}`,
        amount: 2500, // £25.00
        currency: 'gbp',
        status: 'pending',
        merchant_data: {
          name: 'Paul Boulangerie',
          category: 'restaurants',
          mcc: '5812'
        },
        card: {
          id: `ic_test_${Date.now()}`,
          last4: '4242'
        }
      };

    case 'issuing_authorization.updated':
      return {
        id: `iauth_test_${Date.now()}`,
        amount: 2500,
        currency: 'gbp',
        status: 'closed',
        merchant_data: {
          name: 'Paul Boulangerie',
          category: 'restaurants',
          mcc: '5812'
        }
      };

    case 'issuing_card.created':
      return {
        id: `ic_test_${Date.now()}`,
        last4: '4242',
        type: 'virtual',
        status: 'active',
        cardholder: `ich_test_${Date.now()}`
      };

    case 'issuing_cardholder.created':
      return {
        id: `ich_test_${Date.now()}`,
        name: 'Olivia Dubois',
        email: 'olivia.dubois@testlondon.co.uk',
        status: 'active',
        type: 'individual'
      };

    case 'issuing_transaction.created':
      return {
        id: `ipi_test_${Date.now()}`,
        amount: 2500,
        currency: 'gbp',
        merchant_data: {
          name: 'Paul Boulangerie',
          category: 'restaurants'
        }
      };

    case 'account.updated':
      return {
        id: 'acct_test_123',
        charges_enabled: true,
        details_submitted: true,
        business_profile: {
          name: 'Huel'
        }
      };

    default:
      return {
        id: `test_${Date.now()}`,
        status: 'active'
      };
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook Test Endpoint',
    usage: 'POST with { "eventType": "issuing_authorization.created" } to create mock events',
    available_events: [
      'issuing_authorization.created',
      'issuing_authorization.updated', 
      'issuing_card.created',
      'issuing_cardholder.created',
      'issuing_transaction.created',
      'account.updated'
    ]
  });
}