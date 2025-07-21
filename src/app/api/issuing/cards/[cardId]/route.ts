import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler to fetch a single Issuing Card by its ID for a given connected account.
 * This is used by the simulation pages to load the details of the selected card.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const { cardId } = params;
    const accountId = request.nextUrl.searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (!cardId) {
      return NextResponse.json(
        { success: false, message: 'Card ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching card ${cardId} for account ${accountId}`);

    const card = await stripe.issuing.cards.retrieve(cardId, {
      stripeAccount: accountId,
    });

    // The cards list API returns spending_limits but the retrieve one doesn't by default.
    // For consistency in the UI, we'll add it here if it's missing.
    const cardData = {
      ...card,
      spending_limits: card.spending_controls.spending_limits || [],
    };

    return NextResponse.json({
      success: true,
      data: cardData,
    });
    
  } catch (error: any) {
    console.error('Failed to fetch single card:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch card',
        error: error.message,
      },
      { status: 500 }
    );
  }
} 