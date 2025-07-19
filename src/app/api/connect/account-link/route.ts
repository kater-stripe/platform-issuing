import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { accountId, refresh_url, return_url } = await request.json();

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    if (!refresh_url || !return_url) {
      return NextResponse.json({
        success: false,
        error: 'Refresh URL and return URL are required'
      }, { status: 400 });
    }

    // Create account link for completing onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refresh_url,
      return_url: return_url,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      data: {
        url: accountLink.url,
        expires_at: accountLink.expires_at
      }
    });

  } catch (error: any) {
    console.error('Failed to create account link:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create account link'
    }, { status: 500 });
  }
} 