import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { card_id, nonce, accountId } = await request.json();

    if (!card_id || !nonce || !accountId) {
      return NextResponse.json(
        { error: 'card_id, nonce, and accountId are required' },
        { status: 400 }
      );
    }

    console.log('Creating ephemeral key for card:', card_id);

    // Create ephemeral key for secure card data access
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {
        nonce: nonce,
        issuing_card: card_id,
      },
      {
        apiVersion: '2024-06-20', // Use current API version
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      ephemeralKeySecret: ephemeralKey.secret,
      nonce: nonce,
      issuingCard: card_id,
    });
  } catch (error: any) {
    console.error('Ephemeral key creation failed:', error);
    
    let errorMessage = 'Failed to create ephemeral key';
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request: ' + error.message;
    } else if (error.code === 'resource_missing') {
      errorMessage = 'Card not found or not accessible';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
} 