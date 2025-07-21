import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    const accountId = request.nextUrl.searchParams.get('account_id');

    if (!sessionId || !accountId) {
      return NextResponse.json(
        { error: 'Missing session_id or account_id' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      {
        expand: ['payment_intent'],
      },
      {
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      success: true,
      session_id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email,
      payment_intent: session.payment_intent,
      metadata: session.metadata,
    });

  } catch (error: any) {
    console.error('Failed to retrieve session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 