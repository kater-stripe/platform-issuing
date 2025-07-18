import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    // Test basic Stripe connection with balance check
    const balance = await stripe.balance.retrieve();
    
    return NextResponse.json({
      success: true,
      data: {
        balance,
        message: 'Stripe connection successful',
      }
    });
  } catch (error: any) {
    console.error('Stripe connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Stripe',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    // Get connected account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });
    
    return NextResponse.json({
      success: true,
      data: balance
    });
  } catch (error: any) {
    console.error('Failed to retrieve connected account balance:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve balance',
      details: error.message
    }, { status: 500 });
  }
} 