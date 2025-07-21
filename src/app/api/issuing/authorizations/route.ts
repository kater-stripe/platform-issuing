import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Manual Authorization Management Endpoint
 * Allows manual approval/decline of authorizations for demo purposes
 */
export async function POST(request: NextRequest) {
  try {
    const { authorizationId, action, accountId, amount, reason } = await request.json();

    if (!authorizationId || !action || !accountId) {
      return NextResponse.json({
        success: false,
        error: 'authorizationId, action, and accountId are required'
      }, { status: 400 });
    }

    if (!['approve', 'decline'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'action must be either "approve" or "decline"'
      }, { status: 400 });
    }

    console.log(`🎯 Manual authorization ${action}:`, authorizationId);

    const options = { stripeAccount: accountId };

    let result;

    if (action === 'approve') {
      const approveParams: any = {};
      
      // If amount is specified for partial approval
      if (amount && typeof amount === 'number') {
        approveParams.amount = amount;
      }

      result = await stripe.issuing.authorizations.approve(
        authorizationId,
        approveParams,
        options
      );

      console.log('✅ Authorization approved:', result.id);
    } else {
      const declineParams: any = {};
      
      // Set decline reason if provided
      if (reason) {
        declineParams.reason = reason;
      }

      result = await stripe.issuing.authorizations.decline(
        authorizationId,
        declineParams,
        options
      );

      console.log('❌ Authorization declined:', result.id);
    }

    return NextResponse.json({
      success: true,
      action,
      authorization: {
        id: result.id,
        approved: result.approved,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        merchant_data: result.merchant_data,
      }
    });

  } catch (error: any) {
    console.error('Authorization management error:', error);
    
    let errorMessage = 'Failed to process authorization';
    
    if (error.code === 'resource_missing') {
      errorMessage = 'Authorization not found';
    } else if (error.code === 'authorization_already_processed') {
      errorMessage = 'Authorization has already been processed';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Invalid request: ${error.message}`;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message,
      code: error.code,
    }, { status: 500 });
  }
}

/**
 * List authorizations for an account
 */
export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('accountId');
    const cardId = request.nextUrl.searchParams.get('cardId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'accountId is required'
      }, { status: 400 });
    }

    const params: any = { 
      limit: Math.min(limit, 100),
      expand: ['data.card', 'data.cardholder'] 
    };
    
    if (cardId) {
      params.card = cardId;
    }

    const authorizations = await stripe.issuing.authorizations.list(
      params,
      { stripeAccount: accountId }
    );

    return NextResponse.json({
      success: true,
      data: authorizations.data.map(auth => ({
        id: auth.id,
        amount: auth.amount,
        currency: auth.currency,
        approved: auth.approved,
        status: auth.status,
        created: auth.created,
        merchant_data: auth.merchant_data,
        card: auth.card,
        cardholder: auth.cardholder,
        pending_request: auth.pending_request,
      })),
      has_more: authorizations.has_more,
    });

  } catch (error: any) {
    console.error('List authorizations error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to list authorizations',
      details: error.message,
    }, { status: 500 });
  }
} 