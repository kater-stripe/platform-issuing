import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { addToCollection } from '@/lib/storage';

export async function POST(request: NextRequest) {
  let company: any = null;
  
  try {
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json({
        success: false,
        error: 'Company name is required'
      }, { status: 400 });
    }

    company = DEMO_CONFIG.companies.find(c => c.name === companyName);
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found in demo config'
      }, { status: 400 });
    }

    // Create Custom account for card issuing capabilities with enhanced pre-fill data
    const account = await stripe.accounts.create({
      type: 'custom',
      country: company.country,
      email: company.email,
      business_type: company.business_type,
      business_profile: company.business_profile ? {
        name: company.business_profile.name,
        url: company.business_profile.url,
        support_email: company.business_profile.support_email,
        support_phone: company.business_profile.support_phone,
        product_description: company.business_profile.product_description,
        mcc: '7372' // Computer programming services
      } : undefined,
      company: company.company ? {
        name: company.company.name,
        phone: company.company.phone,
        address: company.company.address,
        tax_id: company.company.tax_id,
        structure: company.company.structure as any
      } : undefined,
      capabilities: {
        card_issuing: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        demo_company: companyName,
        demo_phase: 'onboarding',
        demo_created_at: new Date().toISOString()
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

    console.log('✅ Account created successfully:', account.id);
    
    return NextResponse.json({
      success: true,
      accountId: account.id, // Add this for frontend compatibility
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
    console.error('❌ Account creation failed:', error);
    console.error('Company info:', company);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    
    let errorMessage = 'Failed to create connected account';
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Stripe error: ${error.message}`;
    } else if (error.code === 'account_country_invalid_address') {
      errorMessage = 'Invalid country or address information';
    } else if (error.code === 'email_invalid') {
      errorMessage = 'Invalid email address provided';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: {
        type: error.type,
        code: error.code,
        param: error.param,
        decline_code: error.decline_code
      }
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('account_id');
    
    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    // Retrieve account status
    const account = await stripe.accounts.retrieve(accountId);
    
    console.log('📊 Retrieved account data for dashboard:', {
      id: account.id,
      business_profile: account.business_profile,
      company: account.company,
      capabilities: account.capabilities
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        business_profile: account.business_profile,
        company: account.company,
        capabilities: account.capabilities
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