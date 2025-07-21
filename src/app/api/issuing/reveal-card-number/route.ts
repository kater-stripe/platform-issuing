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

    console.log('🔐 Creating ephemeral key for card number reveal:', cardId);

    // Create an ephemeral key for the card to reveal PAN
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {
        issuing_card: cardId,
      },
      {
        apiVersion: '2024-06-20',
        stripeAccount: accountId,
      }
    );

    console.log('✅ Ephemeral key created for card number reveal');

    // Use the ephemeral key to create a temporary Stripe instance
    const ephemeralStripe = require('stripe')(ephemeralKey.secret);
    
    // Get the card details with the ephemeral key to reveal the number
    const cardDetails = await ephemeralStripe.issuing.cards.retrieve(cardId, {
      expand: ['number']
    });

    console.log('✅ Card number retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        card_number: cardDetails.number,
        ephemeral_key: ephemeralKey.secret,
        expires_at: ephemeralKey.expires
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to reveal card number:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to reveal card number',
      details: error.message
    }, { status: 500 });
  }
} 