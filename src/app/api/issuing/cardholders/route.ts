import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addToCollection } from '@/lib/storage';
import { DEMO_CONFIG } from '@/demo-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { accountId, employeeData, companyData } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID required' },
        { status: 400 }
      );
    }

    if (!employeeData) {
      return NextResponse.json(
        { success: false, message: 'Employee data required' },
        { status: 400 }
      );
    }

    console.log('Creating cardholder for account:', accountId);
    console.log('Employee data:', employeeData);

    // Use Olivia's address from demo config as the billing address
    const billingAddress: any = {
      line1: DEMO_CONFIG.olivia.address.line1,
      city: DEMO_CONFIG.olivia.address.city,
      postal_code: DEMO_CONFIG.olivia.address.postal_code,
      country: DEMO_CONFIG.olivia.address.country,
    };

    // Create cardholder on the connected account
    const cardholder = await stripe.issuing.cardholders.create(
      {
        type: 'individual',
        name: employeeData.name,
        email: employeeData.email,
        phone_number: employeeData.phone,
        individual: {
          first_name: employeeData.name.split(' ')[0],
          last_name: employeeData.name.split(' ').slice(1).join(' '),
          dob: {
            day: 15,
            month: 6,
            year: 1990,
          },
        },
        billing: {
          address: billingAddress,
        },
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
      },
      {
        stripeAccount: accountId,
      }
    );

    console.log('Cardholder created successfully:', cardholder.id);

    // Store cardholder in demo state
    await addToCollection('cardholders', {
      id: cardholder.id,
      accountId,
      name: cardholder.name,
      email: cardholder.email,
      phone: cardholder.phone_number,
      status: cardholder.status,
      created: cardholder.created,
      employeeData,
      companyData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: cardholder.id,
        name: cardholder.name,
        email: cardholder.email,
        phone: cardholder.phone_number,
        status: cardholder.status,
        created: cardholder.created,
        spending_limits: cardholder.spending_controls?.spending_limits || [],
        allowed_categories: cardholder.spending_controls?.allowed_categories || [],
        blocked_categories: cardholder.spending_controls?.blocked_categories || [],
      },
              message: `Cardholder created for ${employeeData.name}`,
    });
  } catch (error: any) {
    console.error('Cardholder creation failed:', error);
    
    // Handle specific Stripe Issuing setup errors
          let errorMessage = 'Cardholder creation failed';
    
    if (error.message && error.message.includes('not set up to use Issuing')) {
      errorMessage = 'Stripe Issuing n\'est pas encore activé sur ce compte. En mode démo, cette fonctionnalité nécessite l\'activation d\'Issuing dans le tableau de bord Stripe.';
    } else if (error.message && error.message.includes('Invalid spending_controls')) {
      errorMessage = 'Spending controls configuration error. Check MCC categories.';
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.message,
        issuingRequired: error.message && error.message.includes('not set up to use Issuing'),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID required' },
        { status: 400 }
      );
    }

    console.log('Fetching cardholders for account:', accountId);

    // List cardholders for the connected account
    const cardholders = await stripe.issuing.cardholders.list(
      {
        limit: 100,
      },
      {
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      success: true,
      data: cardholders.data.map(cardholder => ({
        id: cardholder.id,
        name: cardholder.name,
        email: cardholder.email,
        phone: cardholder.phone_number,
        status: cardholder.status,
        created: cardholder.created,
        spending_limits: cardholder.spending_controls?.spending_limits || [],
        allowed_categories: cardholder.spending_controls?.allowed_categories || [],
        blocked_categories: cardholder.spending_controls?.blocked_categories || [],
      })),
      count: cardholders.data.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch cardholders:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve cardholders',
        error: error.message,
      },
      { status: 500 }
    );
  }
} 