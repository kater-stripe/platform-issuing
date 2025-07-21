/**
 * TypeScript interfaces for Stripe Connect & Issuing demo
 * Following @french-configuration-standards
 */

// Demo Configuration Types
export interface DemoConfig {
  olivia: Employee;
  companies: Company[];
  merchants: {
    allowed: Merchant[];
    blocked: Merchant[];
  };
  spendingLimits: SpendingLimitPreset[];
  mccCodes: Record<string, MCCDefinition>;
  relevantWebhookEvents: string[];
  demoPhases: DemoPhase[];
}

export interface Employee {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface Company {
  name: string;
  email: string;
  country: string;
  business_type: 'company' | 'individual';
  business_profile?: {
    name: string;
    url: string;
    support_email: string;
    support_phone: string;
    product_description: string;
  };
  company?: {
    name: string;
    phone: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      postal_code: string;
      country: string;
    };
    tax_id: string;
    structure: string;
  };
  employees: Array<{
    name: string;
    email: string;
    phone: string;
    role: string;
  }>;
}

export interface Merchant {
  name: string;
  mcc: string;
  category: string;
  description: string;
  logo: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number; // in cents
  description: string;
}

export interface SpendingLimitPreset {
  name: string;
  limits: Array<{
    amount: number; // in cents
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }>;
}

export interface MCCDefinition {
  name: string;
  allowed: boolean;
  icon: string;
}

export interface DemoPhase {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

// Stripe Connect Types
export interface ConnectedAccount {
  id: string;
  email: string;
  business_name: string;
  country: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  payouts_enabled: boolean;
  created: number;
}

export interface AccountLink {
  object: 'account_link';
  created: number;
  expires_at: number;
  url: string;
}

// Stripe Issuing Types
export interface Cardholder {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  status: 'active' | 'inactive';
  type: 'individual' | 'company';
  account_id: string;
  billing: {
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
      state?: string;
    };
  };
  individual?: {
    first_name: string;
    last_name: string;
    dob: {
      day: number;
      month: number;
      year: number;
    };
  };
  created: number;
}

export interface IssuingCard {
  id: string;
  cardholder: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  brand: string;
  currency: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'inactive' | 'canceled';
  spending_controls: {
    allowed_categories?: string[];
    blocked_categories?: string[];
    spending_limits?: Array<{
      amount: number;
      interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }>;
  };
  created: number;
}

export interface Authorization {
  id: string;
  amount: number;
  currency: string;
  approved: boolean;
  authorization_method: string;
  card: string;
  cardholder: string;
  created: number;
  merchant_category: string;
  merchant_data: {
    category: string;
    city: string;
    country: string;
    name: string;
    network_id: string;
    postal_code: string;
  };
  network_data: {
    acquiring_institution_id: string;
  };
  pending_request: {
    amount: number;
    currency: string;
    is_amount_controllable: boolean;
    merchant_amount: number;
    merchant_currency: string;
  };
  request_history: Array<{
    amount: number;
    approved: boolean;
    created: number;
    currency: string;
    merchant_amount: number;
    merchant_currency: string;
    reason: string;
  }>;
  status: 'pending' | 'closed' | 'reversed';
  transactions: string[];
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  authorization: string;
  card: string;
  cardholder: string;
  created: number;
  merchant_category_code: string;
  merchant_data: {
    name: string;
    category: string;
    city: string;
    country: string;
  };
  type: 'capture' | 'refund';
}

// Balance and Funding Types
export interface Balance {
  object: 'balance';
  available: Array<{
    amount: number;
    currency: string;
  }>;
  pending: Array<{
    amount: number;
    currency: string;
  }>;
  issuing: {
    available: Array<{
      amount: number;
      currency: string;
    }>;
  };
}

export interface FundingEvent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  created: number;
  status: 'succeeded' | 'pending' | 'failed';
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: any;
  };
  account?: string;
  api_version: string;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Demo State Types
export interface DemoState {
  connectedAccounts: ConnectedAccount[];
  cardholders: Cardholder[];
  cards: IssuingCard[];
  transactions: Transaction[];
  authorizations: Authorization[];
  webhookEvents: WebhookEvent[];
  fundingHistory: FundingEvent[];
  currentStep?: string;
  demoPhaseStatus: Record<string, boolean>;
}

// Form Data Types
export interface CreateCardholderForm {
  name: string;
  email: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  dob: {
    day: number;
    month: number;
    year: number;
  };
  address: {
    line1: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface CreateCardForm {
  cardholder: string;
  currency: string;
  type: 'virtual' | 'physical';
  spending_limits: Array<{
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }>;
  allowed_categories: string[];
  blocked_categories: string[];
}

// Checkout Types
export interface CheckoutSession {
  merchant: Merchant;
  product: Product;
  card?: IssuingCard;
  amount: number;
  currency: string;
}

export interface PaymentResult {
  success: boolean;
  authorization_id?: string;
  decline_reason?: string;
  amount: number;
  currency: string;
  merchant_data: {
    name: string;
    category: string;
  };
} 