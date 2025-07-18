import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';

/**
 * Authorize Payment with Stripe Issuing
 * 
 * This endpoint simulates the authorization flow for Stripe Issuing cards.
 * It checks spending controls and MCC restrictions to determine if a transaction should be approved.
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId, cardId, amount, currency, merchant, products } = await request.json();

    if (!accountId || !cardId || !amount || !merchant) {
      return NextResponse.json(
        { 
          success: false,
          authorized: false,
          message: 'Missing parameters',
          amount,
          currency: currency || 'gbp',
          merchant: merchant?.name || 'Unknown',
          mcc: merchant?.mcc || '0000',
        },
        { status: 400 }
      );
    }

    console.log('Processing authorization for:', {
      accountId,
      cardId,
      amount,
      merchant: merchant.name,
      mcc: merchant.mcc,
    });

    // Get card details to check spending controls
    const card = await stripe.issuing.cards.retrieve(cardId, {
      stripeAccount: accountId,
    });

    // Check if card is active
    if (card.status !== 'active') {
      return NextResponse.json({
        success: true,
        authorized: false,
        amount,
        currency: currency || 'gbp',
        merchant: merchant.name,
        mcc: merchant.mcc,
        reason: 'Inactive card',
        message: 'The card is not active',
      });
    }

    // Check MCC restrictions
    const allowedCategories = card.spending_controls?.allowed_categories || [];
    const blockedCategories = card.spending_controls?.blocked_categories || [];

    // Determine if MCC is allowed based on demo config
    const isAllowedMerchant = DEMO_CONFIG.merchants.allowed.some(m => m.mcc === merchant.mcc);
    const isBlockedMerchant = DEMO_CONFIG.merchants.blocked.some(m => m.mcc === merchant.mcc);

    let authorized = true;
    let reason = '';

    if (isBlockedMerchant) {
      authorized = false;
      reason = 'Merchant category blocked';
    } else if (allowedCategories.length > 0) {
      // Check if this merchant's category is in the allowed categories
      // For simplicity, we'll use the demo config to determine authorization
      if (!isAllowedMerchant) {
        authorized = false;
        reason = 'Merchant category not authorized';
      }
    }

    // Check spending limits
    if (authorized && card.spending_controls?.spending_limits) {
      for (const limit of card.spending_controls.spending_limits) {
        if (amount > limit.amount) {
          authorized = false;
          reason = `Spending limit exceeded (${limit.interval}: £${limit.amount / 100})`;
          break;
        }
      }
    }

    // Generate authorization ID if approved
    const authorizationId = authorized ? `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined;

    const result = {
      success: true,
      authorized,
      amount,
              currency: currency || 'gbp',
      merchant: merchant.name,
      mcc: merchant.mcc,
      reason: authorized ? undefined : reason,
      authorizationId,
              message: authorized 
          ? 'Payment authorized successfully' 
          : `Payment declined: ${reason}`,
    };

    console.log('Authorization result:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Authorization failed:', error);
    return NextResponse.json(
      { 
        success: false,
        authorized: false,
        message: 'Authorization error',
        error: error.message,
        amount: 0,
        currency: 'gbp',
        merchant: 'Unknown',
        mcc: '0000',
      },
      { status: 500 }
    );
  }
} 