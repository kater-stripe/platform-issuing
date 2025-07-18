import Stripe from 'stripe';

// Environment variable validation following @stripe-patterns
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

// Initialize Stripe with latest API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// Export publishable key for client-side usage
export const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Helper function to get connected account context for API calls
export function getConnectedAccountOptions(accountId: string): Stripe.RequestOptions {
  return { stripeAccount: accountId };
}

// Standard error handling pattern following @stripe-patterns
export interface StripeApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function handleStripeError(error: any): StripeApiResponse<never> {
  console.error('Stripe API Error:', error);
  
  if (error.type === 'StripeCardError') {
    return { success: false, error: `Card error: ${error.message}` };
  } else if (error.type === 'StripeInvalidRequestError') {
    return { success: false, error: `Invalid request: ${error.message}` };
  } else if (error.type === 'StripeAPIError') {
    return { success: false, error: 'Stripe API temporarily unavailable' };
  } else if (error.type === 'StripeConnectionError') {
    return { success: false, error: 'Network error connecting to Stripe' };
  } else if (error.type === 'StripeAuthenticationError') {
    return { success: false, error: 'Authentication error with Stripe' };
  }
  
  return { success: false, error: error.message || 'An unexpected error occurred' };
}

// Wrapper function to ensure proper error handling in API calls
export async function safeStripeCall<T>(
  operation: () => Promise<T>,
  context: string
): Promise<StripeApiResponse<T>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Stripe API Error in ${context}:`, error);
    return handleStripeError(error);
  }
}

// Connect-specific utility functions
export const connectUtils = {
  // Create account session for embedded onboarding and issuing
  async createAccountSession(accountId: string): Promise<StripeApiResponse<Stripe.AccountSession>> {
    return safeStripeCall(
      () => stripe.accountSessions.create({
        account: accountId,
        components: {
          account_onboarding: { enabled: true },
          issuing_cards_list: { 
            enabled: true,
            features: {
              card_management: true,
              cardholder_management: true,
              card_spend_dispute_management: true,
              spend_control_management: true,
            },
          },
          issuing_card: { 
            enabled: true,
            features: {
              card_management: true,
              cardholder_management: true,
              card_spend_dispute_management: true,
              spend_control_management: true,
            },
          },
        },
      }),
      'createAccountSession'
    );
  },

  // Retrieve connected account
  async getAccount(accountId: string): Promise<StripeApiResponse<Stripe.Account>> {
    return safeStripeCall(
      () => stripe.accounts.retrieve(accountId),
      'getAccount'
    );
  },

  // Get account balance
  async getBalance(accountId: string): Promise<StripeApiResponse<Stripe.Balance>> {
    return safeStripeCall(
      () => stripe.balance.retrieve(getConnectedAccountOptions(accountId)),
      'getBalance'
    );
  },

  // Create topup for issuing balance
  async createTopup(params: {
    amount: number;
    currency: string;
    description: string;
    accountId: string;
  }): Promise<StripeApiResponse<Stripe.Topup>> {
    return safeStripeCall(
      () => stripe.topups.create({
        amount: params.amount,
        currency: params.currency,
        description: params.description,
      }, getConnectedAccountOptions(params.accountId)),
      'createTopup'
    );
  },

  // Fund issuing balance using test helpers (for demo purposes)
  async fundIssuingBalance(params: {
    amount: number;
    currency: string;
    accountId: string;
  }): Promise<StripeApiResponse<any>> {
    return safeStripeCall(
      async () => {
        // Using direct API call since test helpers might not be in TypeScript types
        const response = await fetch('https://api.stripe.com/v1/test_helpers/issuing/fund_balance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Stripe-Account': params.accountId,
          },
          body: new URLSearchParams({
            amount: params.amount.toString(),
            currency: params.currency,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Stripe API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      },
      'fundIssuingBalance'
    );
  }
};

// Issuing-specific utility functions
export const issuingUtils = {
  // Create cardholder
  async createCardholder(params: {
    name: string;
    email: string;
    phone_number?: string;
    billing: {
      address: {
        line1: string;
        city: string;
        postal_code: string;
        country: string;
      };
    };
    accountId: string;
  }): Promise<StripeApiResponse<Stripe.Issuing.Cardholder>> {
    return safeStripeCall(
      () => stripe.issuing.cardholders.create({
        name: params.name,
        email: params.email,
        phone_number: params.phone_number,
        status: 'active',
        type: 'individual',
        billing: params.billing,
      }, getConnectedAccountOptions(params.accountId)),
      'createCardholder'
    );
  },

  // Create card with spending controls
  async createCard(params: {
    cardholder: string;
    currency: string;
    type: 'virtual' | 'physical';
    spending_controls?: {
      spending_limits?: Array<{
        amount: number;
        interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
      }>;
      allowed_categories?: Stripe.Issuing.Card.SpendingControls.AllowedCategory[];
      blocked_categories?: Stripe.Issuing.Card.SpendingControls.BlockedCategory[];
    };
    accountId: string;
  }): Promise<StripeApiResponse<Stripe.Issuing.Card>> {
    return safeStripeCall(
      () => stripe.issuing.cards.create({
        cardholder: params.cardholder,
        currency: params.currency,
        type: params.type,
        spending_controls: params.spending_controls,
      }, getConnectedAccountOptions(params.accountId)),
      'createCard'
    );
  },

  // List cardholders
  async listCardholders(accountId: string): Promise<StripeApiResponse<Stripe.ApiList<Stripe.Issuing.Cardholder>>> {
    return safeStripeCall(
      () => stripe.issuing.cardholders.list(
        { limit: 100 },
        getConnectedAccountOptions(accountId)
      ),
      'listCardholders'
    );
  },

  // List cards
  async listCards(accountId: string, cardholderId?: string): Promise<StripeApiResponse<Stripe.ApiList<Stripe.Issuing.Card>>> {
    const params: any = { limit: 100 };
    if (cardholderId) {
      params.cardholder = cardholderId;
    }
    
    return safeStripeCall(
      () => stripe.issuing.cards.list(params, getConnectedAccountOptions(accountId)),
      'listCards'
    );
  }
};

// Webhook utilities
export const webhookUtils = {
  // Verify webhook signature following @stripe-patterns
  constructEvent(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  },

  // Check if event is relevant for the demo
  isRelevantEvent(eventType: string): boolean {
    const relevantEvents = [
      'issuing.authorization.created',
      'issuing.authorization.updated',
      'issuing.card.created',
      'issuing.cardholder.created',
      'issuing.transaction.created',
      'account.updated',
      'account.external_account.created'
    ];
    return relevantEvents.includes(eventType);
  }
};