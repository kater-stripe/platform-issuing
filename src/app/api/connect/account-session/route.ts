import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'accountId is required' },
        { status: 400 }
      );
    }

    // Create AccountSession for account onboarding and issuing components
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: {
          enabled: true,
        },
        issuing_cards_list: {
          enabled: true,
          features: {
            card_management: true,
            cardholder_management: true,
            card_spend_dispute_management: true,
            spend_control_management: true,
          },
        },
        issuing_card: {
          enabled: true,
          features: {
            card_management: true,
            cardholder_management: true,
            card_spend_dispute_management: true,
            spend_control_management: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      client_secret: accountSession.client_secret,
    });
  } catch (error: any) {
    console.error('Account session creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account session', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get('accountId');
  
  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'accountId is required' },
      { status: 400 }
    );
  }

  try {
    const account = await stripe.accounts.retrieve(accountId);
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
      }
    });
  } catch (error: any) {
    console.error('Account retrieval failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve account', details: error.message },
      { status: 500 }
    );
  }
} 