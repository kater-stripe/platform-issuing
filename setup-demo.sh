#!/bin/bash

# Pluxee x Stripe Demo Setup Script
# Run this script to add missing dependencies and infrastructure to your existing demo project

set -e

echo "🚀 Setting up Pluxee x Stripe Demo infrastructure..."

# Check if we're in the right directory (should have demo-config.ts)
if [ ! -f "demo-config.ts" ]; then
    echo "❌ Please run this script from the pluxee project root directory"
    exit 1
fi

# Check if this is a Next.js project
if [ ! -f "package.json" ] || ! grep -q "next" package.json; then
    echo "❌ This doesn't appear to be a Next.js project"
    exit 1
fi

echo "✅ Found existing Next.js project with demo config"

# Install missing Stripe dependencies
echo "🔧 Installing Stripe dependencies..."
npm install stripe @stripe/stripe-js @stripe/react-connect-js

# Create missing directories
echo "📁 Creating missing project directories..."
mkdir -p src/lib
mkdir -p src/app/api/connect/{onboarding,account,balance,funding}
mkdir -p src/app/api/issuing/{cardholders,cards,authorizations,transactions}
mkdir -p src/app/api/webhooks
mkdir -p src/app/api/events
mkdir -p src/app/api/checkout/{create,process}
mkdir -p src/app/customer-dashboard
mkdir -p src/app/manage-cards
mkdir -p src/app/webhooks
mkdir -p src/app/checkout/{paul,uber,sephora,gas-station}

# Create Stripe configuration in lib
echo "⚙️ Creating Stripe configuration..."
cat > src/lib/stripe.ts << 'EOF'
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

// Helper function to get connected account context
export function getConnectedAccountOptions(accountId: string) {
  return { stripeAccount: accountId };
}
EOF

# Create storage utilities
echo "💾 Creating local storage utilities..."
cat > src/lib/storage.ts << 'EOF'
interface DemoState {
  connectedAccounts: ConnectedAccount[];
  cardholders: Cardholder[];
  cards: IssuingCard[];
  transactions: Transaction[];
  webhookEvents: WebhookEvent[];
  fundingHistory: FundingEvent[];
}

interface ConnectedAccount {
  id: string;
  email: string;
  business_name: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  created: number;
}

interface Cardholder {
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
    };
  };
}

interface IssuingCard {
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
}

interface Transaction {
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
  };
}

interface WebhookEvent {
  id: string;
  type: string;
  created: number;
  data: any;
}

interface FundingEvent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  created: number;
}

const STORAGE_KEY = 'pluxee-demo-state';

function getDefaultState(): DemoState {
  return {
    connectedAccounts: [],
    cardholders: [],
    cards: [],
    transactions: [],
    webhookEvents: [],
    fundingHistory: []
  };
}

export function getDemoState(): DemoState {
  if (typeof window === 'undefined') return getDefaultState();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...getDefaultState(), ...JSON.parse(stored) } : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

export function updateDemoState(updates: Partial<DemoState>) {
  if (typeof window === 'undefined') return;
  
  const current = getDemoState();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function addToCollection<T>(collection: keyof DemoState, item: T) {
  const current = getDemoState();
  const updated = {
    [collection]: [...(current[collection] as T[]), item]
  };
  updateDemoState(updated);
}

export function clearDemoState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Utility functions for formatting
export function formatCurrency(amount: number, currency: string = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-GB');
}
EOF

# Create demo utilities
echo "🛠️ Creating demo utilities..."
cat > src/lib/demo-utils.ts << 'EOF'
import { DEMO_CONFIG } from '../../demo-config';

export function getDemoData() {
  return DEMO_CONFIG;
}

export function getDefaultCardholder() {
  return DEMO_CONFIG.defaults.cardholder;
}

export function getDefaultCard() {
  return DEMO_CONFIG.defaults.card;
}

export function getMerchantByName(name: string) {
  const allMerchants = [...DEMO_CONFIG.merchants.allowed, ...DEMO_CONFIG.merchants.blocked];
  return allMerchants.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
}

export function isAllowedMCC(mcc: string): boolean {
  return DEMO_CONFIG.merchants.allowed.some(m => m.mcc === mcc);
}

export function getCompanyInfo() {
  return DEMO_CONFIG.companies[0]; // Huel
}

export function getEmployeeInfo() {
  return DEMO_CONFIG.companies[0].employees[0]; // Olivia Dubois
}
EOF

# Create error handling utilities
echo "🚨 Creating error handling utilities..."
cat > src/lib/errors.ts << 'EOF'
export class StripeError extends Error {
  constructor(message: string, public stripeError?: any) {
    super(message);
    this.name = 'StripeError';
  }
}

export function handleStripeError(error: any): { success: false; error: string } {
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
EOF

# Update environment variables if needed
echo "🔐 Updating environment variables..."
if ! grep -q "DEMO_MODE" .env.local; then
    echo "" >> .env.local
    echo "# Demo Configuration" >> .env.local
    echo "DEMO_MODE=true" >> .env.local
fi

# Create placeholder API routes
echo "🔌 Creating placeholder API routes..."

# Connect onboarding route
cat > src/app/api/connect/onboarding/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
// Import stripe when implementing: import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement Connect onboarding during live demo
    return NextResponse.json({ 
      success: false, 
      error: 'Connect onboarding not implemented yet - will be built live!' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
EOF

# Webhook endpoint
cat > src/app/api/webhooks/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
// Import stripe when implementing: import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement webhook handling during live demo
    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}
EOF

# Add demo scripts to package.json
echo "📜 Adding demo scripts..."
npm pkg set scripts.demo="npm run dev"
npm pkg set scripts.stripe:listen="stripe listen --forward-to localhost:3000/api/webhooks"
npm pkg set scripts.setup:complete="echo '✅ Demo setup complete! Add your Stripe keys to .env.local and run npm run demo'"

echo ""
echo "✅ Demo infrastructure setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Add your Stripe API keys to .env.local:"
echo "   - STRIPE_SECRET_KEY=sk_test_..."
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "   - STRIPE_WEBHOOK_SECRET=whsec_... (optional for local testing)"
echo ""
echo "2. Start the development server:"
echo "   npm run demo"
echo ""
echo "3. Open http://localhost:3000"
echo ""
echo "4. For webhook testing, run in another terminal:"
echo "   npm run stripe:listen"
echo ""
echo "🎯 Ready for live coding! The infrastructure is prepared."
echo "📖 See prompts.md for step-by-step live coding instructions"