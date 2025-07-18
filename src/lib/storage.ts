// Local storage utilities for demo state management
// Following @demo-utilities patterns

export interface DemoState {
  connectedAccounts: ConnectedAccount[];
  cardholders: Cardholder[];
  cards: IssuingCard[];
  transactions: Transaction[];
  webhookEvents: WebhookEvent[];
  fundingHistory: FundingEvent[];
  currentStep?: string;
}

export interface ConnectedAccount {
  id: string;
  email: string;
  business_name: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  created: number;
}

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
    };
  };
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
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  created: number;
  data: any;
  account?: string;
}

export interface FundingEvent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  created: number;
}

const STORAGE_KEY = 'stripe-demo-state';

function getDefaultState(): DemoState {
  return {
    connectedAccounts: [],
    cardholders: [],
    cards: [],
    transactions: [],
    webhookEvents: [],
    fundingHistory: [],
    currentStep: undefined,
  };
}

// Get current demo state from localStorage
export function getDemoState(): DemoState {
  if (typeof window === 'undefined') return getDefaultState();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...getDefaultState(), ...JSON.parse(stored) } : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

// Update demo state in localStorage
export function updateDemoState(updates: Partial<DemoState>) {
  if (typeof window === 'undefined') return;
  
  const current = getDemoState();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Add item to a collection in demo state
export function addToCollection<T>(collection: keyof DemoState, item: T) {
  const current = getDemoState();
  const updated = {
    [collection]: [...(current[collection] as T[]), item]
  };
  updateDemoState(updated);
}

// Remove item from collection
export function removeFromCollection<T extends { id: string }>(
  collection: keyof DemoState, 
  itemId: string
) {
  const current = getDemoState();
  const currentArray = current[collection];
  
  // Type guard to ensure we have an array of items with id property
  if (Array.isArray(currentArray) && currentArray.length > 0 && 'id' in currentArray[0]) {
    const updated = {
      [collection]: (currentArray as unknown as T[]).filter(item => item.id !== itemId)
    };
    updateDemoState(updated);
  }
}

// Clear all demo state
export function clearDemoState() {
  if (typeof window === 'undefined') return;
  
  // Clear all specific demo localStorage keys
  const keysToRemove = [
        STORAGE_KEY, // 'stripe-demo-state'
    'demo-account-id',
    'demo-company-name',
    'demo-cards',
    'demo-transactions'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Also clear any other keys that start with 'demo-'
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('demo-') && !keysToRemove.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('Demo state has been completely cleared');
}

// Get specific items from collections
export function getConnectedAccount(): ConnectedAccount | null {
  const state = getDemoState();
  return state.connectedAccounts[0] || null;
}

export function getCardholders(): Cardholder[] {
  const state = getDemoState();
  return state.cardholders;
}

export function getCards(): IssuingCard[] {
  const state = getDemoState();
  return state.cards;
}

export function getRecentWebhookEvents(limit = 10): WebhookEvent[] {
  const state = getDemoState();
  return state.webhookEvents
    .sort((a, b) => b.created - a.created)
    .slice(0, limit);
}

// Demo step tracking
export function setCurrentStep(step: string) {
  updateDemoState({ currentStep: step });
}

export function getCurrentStep(): string | undefined {
  const state = getDemoState();
  return state.currentStep;
}

// Utility functions for formatting (following @demo-utilities)
export function formatCurrency(amount: number, currency: string = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp * 1000));
}

export function formatCardNumber(last4: string): string {
  return `**** **** **** ${last4}`;
}

export function getMCCDescription(mcc: string): string {
  const descriptions: Record<string, string> = {
    '5812': 'Restaurants',
    '4121': 'Taxi & Limousines',
    '5977': 'Cosmetic Stores',
    '5541': 'Gas Stations',
    '7995': 'Gambling',
    '5411': 'Grocery Stores',
    '3000': 'Airlines',
    '7011': 'Hotels'
  };
  return descriptions[mcc] || `MCC ${mcc}`;
}

// Export count helpers for UI
export function getDemoStateCounts() {
  const state = getDemoState();
  return {
    accounts: state.connectedAccounts.length,
    cardholders: state.cardholders.length,
    cards: state.cards.length,
    transactions: state.transactions.length,
    webhookEvents: state.webhookEvents.length,
    fundingEvents: state.fundingHistory.length,
  };
}