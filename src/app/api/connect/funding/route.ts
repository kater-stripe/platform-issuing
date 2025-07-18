import { NextRequest, NextResponse } from 'next/server';
import { connectUtils } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { accountId, amount, currency } = await request.json();
    
    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

          // Default to £1000 (100000 cents) in GBP if not specified
    const fundingAmount = amount || 100000;
    const fundingCurrency = currency || 'gbp';
    
    // Use test helpers to fund the issuing balance
    const result = await connectUtils.fundIssuingBalance({
      amount: fundingAmount,
      currency: fundingCurrency,
      accountId
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to fund issuing balance'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        amount: fundingAmount,
        currency: fundingCurrency,
        message: `Successfully funded issuing balance with ${fundingCurrency.toUpperCase()} ${(fundingAmount / 100).toFixed(2)}`
      }
    });
  } catch (error: any) {
    console.error('Failed to fund issuing balance:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fund issuing balance',
      details: error.message
    }, { status: 500 });
  }
} 