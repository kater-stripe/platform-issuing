import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { cardId, accountId } = await request.json();
    
    if (!cardId) {
      return NextResponse.json({
        success: false,
        error: 'Card ID is required'
      }, { status: 400 });
    }

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    console.log('🔍 Fetching card details for:', cardId, 'on account:', accountId);

    // Retrieve the card with all details
    const card = await stripe.issuing.cards.retrieve(cardId, {
      stripeAccount: accountId,
      expand: ['cardholder']
    });

    console.log('✅ Card details retrieved successfully');

    // Return card details with sensitive data appropriately handled
    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        cardholder: {
          id: card.cardholder?.id,
          name: card.cardholder?.name,
          email: card.cardholder?.email,
          status: card.cardholder?.status,
        },
        brand: card.brand,
        currency: card.currency,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        last4: card.last4,
        status: card.status,
        type: card.type,
        created: card.created,
        spending_controls: card.spending_controls,
        metadata: card.metadata,
        // Note: Full card number is never returned by Stripe API for security
        // The last4 and brand are safe to return
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch card details:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch card details',
      details: error.message
    }, { status: 500 });
  }
} 