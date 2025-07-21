import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addToCollection } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { accountId, cardholderId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID required' },
        { status: 400 }
      );
    }

    if (!cardholderId) {
      return NextResponse.json(
        { success: false, message: 'Cardholder ID required' },
        { status: 400 }
      );
    }

    console.log('Creating card for cardholder:', cardholderId);
    console.log('On account:', accountId);

    // Create virtual card on the connected account
    const card = await stripe.issuing.cards.create(
      {
        cardholder: cardholderId,
        currency: 'gbp',
        type: 'virtual',
        spending_controls: {
          spending_limits: [
            {
              amount: 50000, // £500 in cents
              interval: 'monthly',
            },
            {
              amount: 2500, // £25 in cents
              interval: 'daily',
            },
          ],
          allowed_categories: [
            'eating_places_restaurants',
            'taxicabs_limousines',
            'cosmetic_stores',
          ],
        },
        status: "active",
        metadata: {
          purpose: 'employee_benefits',
          company: 'demo_platform',
          created_via: 'demo_api',
        },
      },
      {
        stripeAccount: accountId,
      }
    );

    console.log('Card created successfully:', card.id);

    // Store card in demo state
    await addToCollection('cards', {
      id: card.id,
      accountId,
      cardholderId,
      last4: card.last4,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      status: card.status,
      type: card.type,
      currency: card.currency,
      created: card.created,
      spending_limits: card.spending_controls?.spending_limits || [],
      allowed_categories: card.spending_controls?.allowed_categories || [],
      blocked_categories: card.spending_controls?.blocked_categories || [],
    });

    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        cardholder: card.cardholder,
        last4: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        status: card.status,
        type: card.type,
        currency: card.currency,
        created: card.created,
        spending_limits: card.spending_controls?.spending_limits || [],
        allowed_categories: card.spending_controls?.allowed_categories || [],
        blocked_categories: card.spending_controls?.blocked_categories || [],
      },
      message: 'Virtual card created successfully',
    });
  } catch (error: any) {
    console.error('Card creation failed:', error);
    
    // Handle specific Stripe errors
          let errorMessage = 'Card creation failed';
    
    if (error.type === 'StripeCardError') {
      errorMessage = 'Card error: ' + error.message;
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Requête invalide: ' + error.message;
    } else if (error.code === 'cardholder_verification_required') {
      errorMessage = 'Cardholder verification required';
    } else if (error.code === 'insufficient_funds') {
      errorMessage = 'Fonds insuffisants sur le compte';
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('accountId');
    const cardholderId = request.nextUrl.searchParams.get('cardholderId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID required' },
        { status: 400 }
      );
    }

    console.log('Fetching cards for account:', accountId);
    if (cardholderId) {
      console.log('Filtering by cardholder:', cardholderId);
    }

    // List cards for the connected account
    const listParams: any = {
      limit: 100,
    };

    if (cardholderId) {
      listParams.cardholder = cardholderId;
    }

    const cards = await stripe.issuing.cards.list(
      listParams,
      {
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      success: true,
      data: cards.data.map(card => ({
        id: card.id,
        cardholder: card.cardholder,
        last4: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        status: card.status,
        type: card.type,
        currency: card.currency,
        created: card.created,
        spending_limits: card.spending_controls?.spending_limits || [],
        allowed_categories: card.spending_controls?.allowed_categories || [],
        blocked_categories: card.spending_controls?.blocked_categories || [],
      })),
      count: cards.data.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch cards:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve cards',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Update card status or spending controls
export async function PATCH(request: NextRequest) {
  try {
    const { accountId, cardId, status, spending_controls } = await request.json();

    if (!accountId || !cardId) {
      return NextResponse.json(
        { success: false, message: 'Account ID and card ID required' },
        { status: 400 }
      );
    }

    console.log('Updating card:', cardId);

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (spending_controls) {
      updateData.spending_controls = spending_controls;
    }

    const card = await stripe.issuing.cards.update(
      cardId,
      updateData,
      {
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        cardholder: card.cardholder,
        last4: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        status: card.status,
        type: card.type,
        currency: card.currency,
        created: card.created,
        spending_limits: card.spending_controls?.spending_limits || [],
        allowed_categories: card.spending_controls?.allowed_categories || [],
        blocked_categories: card.spending_controls?.blocked_categories || [],
      },
      message: 'Card updated successfully',
    });
  } catch (error: any) {
    console.error('Card update failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update card',
        error: error.message,
      },
      { status: 500 }
    );
  }
} 