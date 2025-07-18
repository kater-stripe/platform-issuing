import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';
import { addToCollection } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json({
        success: false,
        error: 'Company name is required'
      }, { status: 400 });
    }

    const company = DEMO_CONFIG.companies.find(c => c.name === companyName);
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found in demo config'
      }, { status: 400 });
    }

    // Create Custom account for card issuing capabilities
    const account = await stripe.accounts.create({
      type: 'custom',
              country: 'GB',
      email: company.email,
      capabilities: {
        card_issuing: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        demo_company: companyName,
        demo_phase: 'onboarding'
      }
    });

    // Store account in demo state
    addToCollection('connectedAccounts', {
      id: account.id,
      email: company.email,
      business_name: company.name,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      created: account.created,
    });

    return NextResponse.json({
      success: true,
      data: {
        account: {
          id: account.id,
          business_name: company.name,
          email: company.email,
          charges_enabled: account.charges_enabled,
          details_submitted: account.details_submitted,
        }
      }
    });

  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create connected account'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get('account_id');
    
    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    // Retrieve account status
    const account = await stripe.accounts.retrieve(accountId);
    
    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        business_profile: account.business_profile,
      }
    });

  } catch (error: any) {
    console.error('Failed to retrieve account:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve account',
      details: error.message,
    }, { status: 500 });
  }
} 