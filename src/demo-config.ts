/**
 * Pluxee SnackPack Demo Configuration
 * 
 * Configuration for Pluxee's SME-focused MVP: "SnackPack" - a modern benefits
 * package targeting small businesses, bypassing traditional banking constraints.
 */

export const DEMO_CONFIG = {
  // Main story character - Sophie Martin at TechStart London
  sophie: {
    name: 'Sophie Martin',
    email: 'sophie.martin@techstart.london',
    phone: '+447123456789',
    address: {
      line1: '25 Shoreditch High Street',
      city: 'London', 
      postal_code: 'E1 6PN',
      country: 'GB'
    },
    role: 'Product Manager',
    employeeId: 'TS-042'
  },

  // SME clients for SnackPack onboarding
  companies: [
    {
      name: 'TechStart London',
      email: 'benefits@techstart.london',
      country: 'GB',
      business_type: 'company' as const,
      size: '50 employees',
      industry: 'Technology Startup',
      business_profile: {
        name: 'TechStart London',
        url: 'https://techstart.london',
        support_email: 'hr@techstart.london',
        support_phone: '+442071234567',
        product_description: 'AI-powered productivity tools for remote teams'
      },
      company: {
        name: 'TechStart London',
        phone: '+442071234567',
        address: {
          line1: '25 Shoreditch High Street',
          line2: 'WeWork Building, Floor 3',
          city: 'London',
          postal_code: 'E1 6PN',
          country: 'GB'
        },
        tax_id: 'GB987654321',
        structure: 'private_corporation'
      },
      employees: [
        {
          name: 'Sophie Martin',
          email: 'sophie.martin@techstart.london',
          phone: '+447123456789',
          role: 'Product Manager'
        },
        {
          name: 'James Richardson',
          email: 'james.richardson@techstart.london',
          phone: '+447123456790',
          role: 'Engineering Lead'
        },
        {
          name: 'Emma Thompson',
          email: 'emma.thompson@techstart.london',
          phone: '+447123456791', 
          role: 'Head of People'
        }
      ]
    },
    {
      name: 'GreenSpark Media',
      email: 'benefits@greenspark.uk',
      country: 'GB',
      business_type: 'company' as const,
      size: '30 employees',
      industry: 'Digital Marketing',
      employees: [
        {
          name: 'Alex Chen',
          email: 'alex.chen@greenspark.uk',
          phone: '+447123456792',
          role: 'Creative Director'
        }
      ]
    },
    {
      name: 'HealthTech Solutions',
      email: 'hr@healthtech.solutions',
      country: 'GB',
      business_type: 'company' as const, 
      size: '75 employees',
      industry: 'Healthcare Technology',
      employees: [
        {
          name: 'Dr. Sarah Wilson',
          email: 'sarah.wilson@healthtech.solutions',
          phone: '+447123456793',
          role: 'Chief Medical Officer'
        }
      ]
    }
  ],

  // SnackPack benefit merchants - organized by wallet type
  merchants: {
    // Meal Wallet merchants (£15 daily limit)
    meal: [
      {
        name: 'Paul',
        mcc: '5812',
        category: 'restaurants',
        wallet: 'meal',
        description: 'French bakery and café chain - perfect for lunch meetings',
        logo: '🥖',
        products: [
          { id: 'business-lunch', name: 'Business Lunch Combo', price: 1250, description: 'Salad + Coffee + Pastry' },
          { id: 'coffee', name: 'Premium Coffee', price: 380, description: 'Artisan espresso coffee' },
          { id: 'sandwich', name: 'Gourmet Sandwich', price: 750, description: 'Fresh ingredients, perfect for quick meals' },
          { id: 'team-snacks', name: 'Team Meeting Snacks', price: 1450, description: 'Pastries and coffee for 4 people' }
        ]
      },
    ],
    // Transport Wallet merchants (£100 monthly limit)
    transport: [
      {
        name: 'Uber',
        mcc: '4121',
        category: 'taxi_limousines', 
        wallet: 'transport',
        description: 'Business transportation - client meetings and events',
        logo: '🚗',
        products: [
          { id: 'client-meeting', name: 'Client Meeting Ride', price: 1250, description: 'Professional transport to client offices' },
          { id: 'airport-transfer', name: 'Airport Transfer', price: 4500, description: 'Business travel to Heathrow' },
          { id: 'conference-transport', name: 'Conference Transport', price: 800, description: 'Quick ride to industry events' }
        ]
      },
      {
        name: 'TfL Oyster',
        mcc: '4111',
        category: 'public_transport',
        wallet: 'transport',
        description: 'London public transport - sustainable commuting',
        logo: '🚇',
        products: [
          { id: 'daily-travel', name: 'Daily Zone 1-3', price: 800, description: 'Full day travel across central London' },
          { id: 'weekly-pass', name: 'Weekly Travel Pass', price: 4200, description: 'Unlimited weekly travel' }
        ]
      },
    ],
    // Wellness Wallet merchants (£50 monthly limit)
    wellness: [
      {
        name: 'PureGym',
        mcc: '7997',
        category: 'fitness_wellness',
        wallet: 'wellness',
        description: 'Employee fitness and wellbeing - mental health support',
        logo: '💪',
        products: [
          { id: 'gym-membership', name: 'Monthly Gym Access', price: 2999, description: 'Full gym access + classes' },
          { id: 'personal-training', name: 'Personal Training Session', price: 4500, description: '1-on-1 fitness coaching' },
          { id: 'wellness-class', name: 'Yoga/Meditation Class', price: 1800, description: 'Stress relief and mindfulness' }
        ]
      },
      {
        name: 'Boots Pharmacy',
        mcc: '5912',
        category: 'health_pharmacy',
        wallet: 'wellness',
        description: 'Health essentials and workplace wellness',
        logo: '🏥',
        products: [
          { id: 'health-checkup', name: 'Health MOT', price: 3500, description: 'Comprehensive health screening' },
          { id: 'eye-test', name: 'Eye Test & Glasses', price: 2500, description: 'Vision care for screen work' },
          { id: 'wellness-vitamins', name: 'Workplace Wellness Pack', price: 1200, description: 'Vitamins and supplements' }
        ]
      }
    ],
    // Blocked merchants (compliance and policy)
    blocked: [
      {
        name: 'Shell Petrol Station',
        mcc: '5541',
        category: 'gas_stations',
        wallet: 'blocked',
        description: 'Fuel purchases (not covered by SnackPack benefits)',
        logo: '⛽',
        products: [
          { id: 'petrol', name: 'Petrol Fill-up', price: 6500, description: 'Personal fuel - not a business benefit' },
          { id: 'car-wash', name: 'Car Wash', price: 1200, description: 'Vehicle maintenance' }
        ]
      },
      {
        name: 'Grosvenor Casino',
        mcc: '7995', 
        category: 'gambling',
        wallet: 'blocked',
        description: 'Gambling (compliance policy - always blocked)',
        logo: '🎰',
        products: [
          { id: 'casino-chips', name: 'Casino Chips', price: 5000, description: 'Entertainment gambling' }
        ]
      },
      {
        name: 'Harrods Luxury',
        mcc: '5311',
        category: 'luxury_retail',
        wallet: 'blocked', 
        description: 'High-end retail (outside SnackPack scope)',
        logo: '💎',
        products: [
          { id: 'luxury-watch', name: 'Designer Watch', price: 250000, description: 'Personal luxury item' }
        ]
      }
    ]
  },

  // SnackPack benefit wallet limits (designed for SMEs)
  snackPackWallets: [
    {
      name: 'Meal Wallet',
      category: 'meal',
      description: 'Business meals, coffee, and team snacks',
      limits: [
        { amount: 1500, interval: 'daily' as const },    // £15/day
        { amount: 32500, interval: 'monthly' as const }   // £325/month (£15 x 21.5 working days)
      ],
      allowedMccs: ['5812', '5814', '5499'], // Restaurants, fast food, misc food
      icon: '🍽️',
      color: '#00EB5E'
    },
    {
      name: 'Transport Wallet', 
      category: 'transport',
      description: 'Business travel, client meetings, conferences',
      limits: [
        { amount: 10000, interval: 'monthly' as const }   // £100/month
      ],
      allowedMccs: ['4121', '4111', '4131'], // Taxi, public transport, bus
      icon: '🚗',
      color: '#88DDFA'
    },
    {
      name: 'Wellness Wallet',
      category: 'wellness', 
      description: 'Employee health, fitness, and wellbeing',
      limits: [
        { amount: 5000, interval: 'monthly' as const }    // £50/month
      ],
      allowedMccs: ['7997', '5912', '7298'], // Fitness, pharmacy, health services
      icon: '💪',
      color: '#FDEEC1'
    }
  ],

  // SnackPack MCC definitions by wallet type
  mccCodes: {
    // Meal Wallet MCCs
    '5812': { name: 'Restaurants', wallet: 'meal', allowed: true, icon: '🍽️' },
    '5814': { name: 'Fast Food', wallet: 'meal', allowed: true, icon: '🍔' },
    '5499': { name: 'Misc Food Stores', wallet: 'meal', allowed: true, icon: '🥪' },
    
    // Transport Wallet MCCs  
    '4121': { name: 'Taxi & Limousines', wallet: 'transport', allowed: true, icon: '🚕' },
    '4111': { name: 'Public Transport', wallet: 'transport', allowed: true, icon: '🚇' },
    '4131': { name: 'Bus Lines', wallet: 'transport', allowed: true, icon: '🚌' },
    
    // Wellness Wallet MCCs
    '7997': { name: 'Fitness & Recreation', wallet: 'wellness', allowed: true, icon: '💪' },
    '5912': { name: 'Drug Stores & Pharmacies', wallet: 'wellness', allowed: true, icon: '🏥' },
    '7298': { name: 'Health & Beauty Spas', wallet: 'wellness', allowed: true, icon: '🧘' },
    
    // Blocked MCCs
    '5541': { name: 'Gas Stations', wallet: 'blocked', allowed: false, icon: '⛽' },
    '7995': { name: 'Gambling', wallet: 'blocked', allowed: false, icon: '🎰' },
    '5311': { name: 'Department Stores', wallet: 'blocked', allowed: false, icon: '🏪' },
    '5921': { name: 'Package Stores-Beer/Wine/Liquor', wallet: 'blocked', allowed: false, icon: '🍷' }
  } as Record<string, { name: string; wallet: string; allowed: boolean; icon: string }>,

  // SnackPack webhook events for SME insights
  relevantWebhookEvents: [
    'issuing_authorization.request',   // Real-time SnackPack benefit decisions
    'issuing_authorization.created',   // Benefit usage tracking
    'issuing_authorization.updated',   // Spending pattern changes
    'issuing_card.created',            // New employee onboarding
    'issuing_cardholder.created',      // Team growth tracking
    'issuing_transaction.created',     // Benefit utilization analytics
    'account.updated',                 // SME account status changes
    'account.external_account.created' // Funding method updates
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
      description: 'Test London Ltd onboarding with embedded component and pre-filled data'
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

  // Pluxee brand UI constants
  ui: {
    colors: {
      primary: '#221C46',      // Pluxee navy
      secondary: '#00EB5E',    // Pluxee green
      accent: '#88DDFA',       // Pluxee light blue
      tertiary: '#FDEEC1',     // Pluxee soft yellow
      success: '#00EB5E',      // Success (Pluxee green)
      error: '#DC2626',        // Error red
      warning: '#F59E0B',      // Warning amber
      info: '#88DDFA'          // Info (Pluxee blue)
    },
    breakpoints: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px'
    }
  },

  // SnackPack default values for quick demo
  defaults: {
    cardholder: {
      name: 'Sophie Martin',
      email: 'sophie.martin@techstart.london',
      phone_number: '+447123456789',
      billing: {
        address: {
          line1: '25 Shoreditch High Street',
          city: 'London',
          postal_code: 'E1 6PN',
          country: 'GB'
        }
      },
      role: 'Product Manager',
      department: 'Product'
    },
    snackPackCard: {
      currency: 'gbp',
      type: 'virtual' as const,
      spending_controls: {
        // Multi-wallet structure
        meal_wallet: {
          daily_limit: 1500,   // £15/day
          monthly_limit: 32500, // £325/month
          allowed_mccs: ['5812', '5814', '5499']
        },
        transport_wallet: {
          monthly_limit: 10000, // £100/month 
          allowed_mccs: ['4121', '4111', '4131']
        },
        wellness_wallet: {
          monthly_limit: 5000,  // £50/month
          allowed_mccs: ['7997', '5912', '7298']
        }
      }
    },
    funding: {
      amount: 200000, // £2000 (SME-appropriate starting amount)
      currency: 'gbp',
      description: 'SnackPack pilot funding for TechStart London'
    }
  }
};

// SnackPack utility functions
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
      wallet: 'unknown',
      allowed: false, 
      icon: '❓' 
    };
  },

  getWalletFromMCC: (mcc: string) => {
    const mccInfo = DEMO_CONFIG.mccCodes[mcc];
    return mccInfo?.wallet || 'blocked';
  },

  getWalletConfig: (walletType: string) => {
    return DEMO_CONFIG.snackPackWallets.find(w => w.category === walletType);
  },

  getRandomSMEEmployee: () => {
    const companies = DEMO_CONFIG.companies;
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const employees = randomCompany.employees;
    return employees[Math.floor(Math.random() * employees.length)];
  },

  getRandomSME: () => {
    const companies = DEMO_CONFIG.companies;
    return companies[Math.floor(Math.random() * companies.length)];
  },

  generateSnackPackCardNumber: () => {
    // Generate last 4 digits for SnackPack cards
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  calculateTotalSnackPackLimit: () => {
    return DEMO_CONFIG.snackPackWallets.reduce((total, wallet) => {
      const monthlyLimit = wallet.limits.find(l => l.interval === 'monthly')?.amount || 0;
      return total + monthlyLimit;
    }, 0);
  }
};

export type DemoConfig = typeof DEMO_CONFIG;
export type DemoPhase = typeof DEMO_CONFIG.demoPhases[0];
export type SnackPackWallet = typeof DEMO_CONFIG.snackPackWallets[0];
export type SMECompany = typeof DEMO_CONFIG.companies[0];
export type SMEEmployee = typeof DEMO_CONFIG.companies[0]['employees'][0];

// Legacy exports for backward compatibility
export type Merchant = typeof DEMO_CONFIG.merchants.meal[0];
export type Company = SMECompany;
export type Employee = SMEEmployee; 