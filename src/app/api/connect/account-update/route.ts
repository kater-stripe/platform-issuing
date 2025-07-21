import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/demo-config';

export async function POST(request: NextRequest) {
  let company: any = null;
  
  try {
    const { accountId, companyName } = await request.json();
    
    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    if (!companyName) {
      return NextResponse.json({
        success: false,
        error: 'Company name is required'
      }, { status: 400 });
    }

    console.log('🔍 Looking for company:', companyName);
    console.log('🔍 Available companies:', DEMO_CONFIG.companies.map(c => c.name));
    
    company = DEMO_CONFIG.companies.find(c => c.name === companyName);
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found in demo config'
      }, { status: 400 });
    }

    console.log('✅ Found company:', company.name);
    console.log('📝 Updating account with enhanced pre-fill data:', accountId);
    console.log('📝 Company data being applied:', {
      business_profile: company.business_profile,
      company: company.company
    });

    // Prepare update data - use enhanced data if available, fallback to basic company info
    const updateData: any = {};

    if (company.business_profile) {
      updateData.business_profile = {
        name: company.business_profile.name,
        url: company.business_profile.url,
        support_email: company.business_profile.support_email,
        support_phone: company.business_profile.support_phone,
        product_description: company.business_profile.product_description,
        mcc: '7372' // Computer programming services
      };
    } else {
      // Fallback to basic business profile with company name
      updateData.business_profile = {
        name: company.name,
        mcc: '7372' // Computer programming services
      };
    }

    if (company.company) {
      updateData.company = {
        name: company.company.name,
        phone: company.company.phone,
        address: company.company.address,
        tax_id: company.company.tax_id,
        structure: company.company.structure as any
      };
    } else {
      // Fallback to basic company info
      updateData.company = {
        name: company.name
      };
    }

    updateData.settings = {
      payouts: {
        schedule: {
          interval: 'manual' // For demo purposes
        }
      }
    };

    updateData.metadata = {
      demo_enhanced: 'true',
      demo_updated_at: new Date().toISOString(),
      demo_pre_fill_complete: 'true',
      demo_company: companyName,
      demo_phase: 'pre_filled'
    };

    console.log('📋 Final update data being sent to Stripe:', updateData);

    // Update the account with comprehensive pre-fill data
    const updatedAccount = await stripe.accounts.update(accountId, updateData);

    console.log('✅ Account updated successfully with pre-fill data');
    console.log('✅ Updated account business_profile:', updatedAccount.business_profile);
    console.log('✅ Updated account company:', updatedAccount.company);
    
    return NextResponse.json({
      success: true,
      data: {
        account: {
          id: updatedAccount.id,
          business_name: updatedAccount.business_profile?.name || company.name,
          charges_enabled: updatedAccount.charges_enabled,
          details_submitted: updatedAccount.details_submitted,
          payouts_enabled: updatedAccount.payouts_enabled,
          business_profile: updatedAccount.business_profile,
          company: updatedAccount.company
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Account update failed:', error);
    console.error('Company info:', company);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    
    let errorMessage = 'Failed to update account';
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Stripe error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: {
        type: error.type,
        code: error.code,
        param: error.param
      }
    }, { status: 500 });
  }
} 