/**
 * Demo Configuration for Stripe Connect & Issuing Live Coding Session
 * 
 * This file contains all the pre-configured data for the demo to ensure
 * smooth live coding and allow multiple attendees to interact with the app.
 */

export const DEMO_CONFIG = {
  // Main story character
  olivia: {
    name: 'Olivia Dubois',
    email: 'olivia.dubois@testlondon.co.uk',
    phone: '+447123456789',
    address: {
      line1: '16 Oxford Street',
      city: 'London',
      postal_code: 'W1C 1AA',
      country: 'GB'
    }
  },

  // Enterprise clients for Connect onboarding
  companies: [
    {
      name: 'Huel',
      email: 'corporate@testlondon.co.uk',
      country: 'GB',
      business_type: 'company' as const,
      employees: [
        {
          name: 'Olivia Dubois',
          email: 'olivia.dubois@testlondon.co.uk',
          phone: '+447123456789',
          role: 'Marketing Manager'
        },
        {
          name: 'Pierre Martin',
          email: 'pierre.martin@testlondon.co.uk', 
          phone: '+447123456790',
          role: 'Sales Director'
        },
        {
          name: 'Sophie Laurent',
          email: 'sophie.laurent@testlondon.co.uk',
          phone: '+447123456791',
          role: 'HR Manager'
        }
      ]
    },
    {
      name: 'Ta%fix',
              email: 'corporate@tafix.co.uk',
      country: 'GB',
      business_type: 'company' as const,
      employees: [
        {
          name: 'Jean Dupont',
          email: 'jean.dupont@tafix.co.uk',
          phone: '+447123456792',
          role: 'Operations Manager'
        }
      ]
    },
    {
      name: 'Oktopost',
              email: 'corporate@oktopost.co.uk',
      country: 'GB', 
      business_type: 'company' as const,
      employees: [
        {
          name: 'Marie Dubois',
          email: 'marie.dubois@oktopost.co.uk',
          phone: '+447123456793',
          role: 'Finance Director'
        }
      ]
    }
  ],

  // Merchant scenarios for issuing transactions simulation
  merchants: {
    allowed: [
      {
        name: 'Paul',
        mcc: '5812',
        category: 'restaurants',
        description: 'French bakery and café chain',
        logo: '🥖',
        products: [
          { id: 'croissant', name: 'Croissant', price: 250, description: 'Fresh butter croissant' },
          { id: 'coffee', name: 'Coffee', price: 180, description: 'Espresso coffee' },
          { id: 'sandwich', name: 'Ham Sandwich', price: 650, description: 'Ham and butter sandwich' },
          { id: 'salad', name: 'Caesar Salad', price: 850, description: 'Caesar salad with chicken' }
        ]
      },
      {
        name: 'Uber',
        mcc: '4121', 
        category: 'taxi_limousines',
        description: 'Ride-sharing service',
        logo: '🚗',
        products: [
          { id: 'uber-x', name: 'UberX', price: 1250, description: 'Standard ride across London' },
          { id: 'uber-pool', name: 'UberPool', price: 850, description: 'Shared ride to save money' },
          { id: 'uber-comfort', name: 'Uber Comfort', price: 1650, description: 'Premium ride with more space' }
        ]
      },
      {
        name: 'Sephora',
        mcc: '5977',
        category: 'cosmetic_stores', 
        description: 'Beauty and cosmetics retailer',
        logo: '💄',
        products: [
          { id: 'lipstick', name: 'Lipstick', price: 2200, description: 'Luxury lipstick' },
          { id: 'perfume', name: 'Perfume', price: 7500, description: 'Designer fragrance 50ml' },
          { id: 'foundation', name: 'Foundation', price: 3200, description: 'Long-lasting foundation' },
          { id: 'mascara', name: 'Mascara', price: 1800, description: 'Volumizing mascara' }
        ]
      }
    ],
    blocked: [
      {
        name: 'Gas Station',
        mcc: '5541',
        category: 'gas_stations',
        description: 'Gas station (blocked by policy)',
        logo: '⛽',
        products: [
          { id: 'gasoline', name: 'Unleaded Petrol', price: 6500, description: '50L unleaded petrol' },
          { id: 'diesel', name: 'Diesel', price: 6200, description: '50L diesel fuel' },
          { id: 'snacks', name: 'Snacks', price: 350, description: 'Convenience store items' }
        ]
      },
      {
        name: 'Casino',
        mcc: '7995',
        category: 'gambling',
        description: 'Casino (blocked by policy)',
        logo: '🎰',
        products: [
          { id: 'chips', name: 'Casino Chips', price: 10000, description: '£100 in casino chips' }
        ]
      }
    ]
  },

  // Spending control presets
  spendingLimits: [
    {
      name: 'Standard Employee',
      limits: [
        { amount: 50000, interval: 'monthly' as const }, // €500/month
        { amount: 2500, interval: 'daily' as const }     // €25/day
      ]
    },
    {
      name: 'Manager',
      limits: [
        { amount: 150000, interval: 'monthly' as const }, // €1500/month
        { amount: 7500, interval: 'daily' as const }      // €75/day
      ]
    },
    {
      name: 'Executive',
      limits: [
        { amount: 300000, interval: 'monthly' as const }, // €3000/month
        { amount: 15000, interval: 'daily' as const }     // €150/day
      ]
    }
  ],

  // MCC (Merchant Category Code) definitions
  mccCodes: {
    '5812': { name: 'Restaurants', allowed: true, icon: '🍽️' },
    '4121': { name: 'Taxi & Limousines', allowed: true, icon: '🚕' },
    '5977': { name: 'Cosmetic Stores', allowed: true, icon: '💄' },
    '5541': { name: 'Gas Stations', allowed: false, icon: '⛽' },
    '7995': { name: 'Gambling', allowed: false, icon: '🎰' },
    '5411': { name: 'Grocery Stores', allowed: true, icon: '🛒' },
    '3000': { name: 'Airlines', allowed: true, icon: '✈️' },
    '7011': { name: 'Hotels', allowed: true, icon: '🏨' }
  } as Record<string, { name: string; allowed: boolean; icon: string }>,

  // Webhook events to highlight during demo
  relevantWebhookEvents: [
    'issuing_authorization.request',   // Real-time authorization requests (must respond within 2s)
    'issuing_authorization.created',
    'issuing_authorization.updated',
    'issuing_card.created',
    'issuing_cardholder.created', 
    'issuing_transaction.created',
    'account.updated',
    'account.external_account.created'
  ],

  // Demo phases and their completion status
  demoPhases: [
    {
      id: 'setup',
      name: 'Setup & Introduction',
      duration: '5 min',
      description: 'Stripe dashboard setup and project overview'
    },
    {
      id: 'onboarding',
      name: 'Connect Onboarding',
      duration: '10 min', 
      description: 'Huel onboarding with embedded component'
    },
    {
      id: 'dashboard',
      name: 'Customer Dashboard',
      duration: '15 min',
      description: 'Account balance and funding simulation'
    },
    {
      id: 'cards',
      name: 'Card Management',
      duration: '30 min',
      description: 'Create Olivia, issue card with spending controls'
    },
    {
      id: 'webhooks',
      name: 'Real-time Monitoring',
      duration: '15 min',
      description: 'Webhook setup and event streaming'
    },
    {
      id: 'payments',
      name: 'Issuing Transactions Simulation',
      duration: '25 min',
      description: 'Test MCC controls and spending limits'
    }
  ],

  // API endpoints for reference
  apiEndpoints: {
    connect: {
      onboarding: '/api/connect/onboarding',
      account: '/api/connect/account',
      balance: '/api/connect/balance',
      funding: '/api/connect/funding'
    },
    issuing: {
      cardholders: '/api/issuing/cardholders',
      cards: '/api/issuing/cards',
      authorizations: '/api/issuing/authorizations',
      transactions: '/api/issuing/transactions'
    },
    webhooks: {
      endpoint: '/api/webhooks',
      events: '/api/events'
    },
    checkout: {
      create: '/api/checkout/create',
      process: '/api/checkout/process'
    }
  },

  // UI constants
  ui: {
    colors: {
      primary: '#00B894',      // Brand green
      secondary: '#2D3748',    // Dark gray
      success: '#48BB78',      // Success green
      error: '#F56565',        // Error red
      warning: '#ED8936',      // Warning orange
      info: '#4299E1'          // Info blue
    },
    breakpoints: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px'
    }
  },

  // Default form values for quick demo
  defaults: {
    cardholder: {
      name: 'Olivia Dubois',
      email: 'olivia.dubois@testlondon.co.uk',
      phone_number: '+447123456789',
      billing: {
        address: {
          line1: '16 Oxford Street',
          city: 'London',
          postal_code: 'W1C 1AA',
          country: 'GB'
        }
      }
    },
    card: {
      currency: 'gbp',
      type: 'virtual' as const,
      spending_controls: {
        allowed_categories: ['restaurants', 'taxi_limousines', 'cosmetic_stores'],
        spending_limits: [
          { amount: 500000, interval: 'monthly' as const }, // £5000/month
          { amount: 25000, interval: 'daily' as const }     // £250/day
        ]
      }
    },
    funding: {
      amount: 100000, // £1000
      currency: 'gbp',
      description: 'Demo funding for corporate cards'
    }
  }
};

// Utility functions for the demo
export const demoUtils = {
  formatCurrency: (amount: number, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  },

  formatDate: (timestamp: number) => {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(timestamp * 1000));
  },

  getMCCInfo: (mcc: string) => {
    return DEMO_CONFIG.mccCodes[mcc] || { 
      name: `MCC ${mcc}`, 
      allowed: false, 
      icon: '❓' 
    };
  },

  getRandomEmployee: () => {
    const companies = DEMO_CONFIG.companies;
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const employees = randomCompany.employees;
    return employees[Math.floor(Math.random() * employees.length)];
  },

  getRandomCompany: () => {
    const companies = DEMO_CONFIG.companies;
    return companies[Math.floor(Math.random() * companies.length)];
  },

  generateCardNumber: () => {
    // Generate last 4 digits for display
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
};

export type DemoConfig = typeof DEMO_CONFIG;
export type DemoPhase = typeof DEMO_CONFIG.demoPhases[0];
export type Merchant = typeof DEMO_CONFIG.merchants.allowed[0];
export type Company = typeof DEMO_CONFIG.companies[0];
export type Employee = typeof DEMO_CONFIG.companies[0]['employees'][0]; 