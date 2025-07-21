# Pluxee x Stripe Issuing & Connect Demo

**Meeting**: 2-hour live coding demo with Pluxee Product & Tech teams  
**Date**: Tomorrow  
**Objective**: Demonstrate Stripe's issuing and connect capabilities through live coding  
**Story**: Olivia Dubois (Test London Ltd employee) using her corporate card with spending controls

## 🎯 Demo Narrative

**The Business Story**: Pluxee wants to offer corporate cards to enterprise clients like BNP Paribas, with real-time spending controls and monitoring capabilities.

**The User Journey**: Follow Olivia Dubois, a BNP Paribas employee, from card creation to making purchases with MCC-based restrictions.

## 📋 Pre-Demo Checklist

### Stripe Dashboard Setup (Do in Browser)
- [ ] Create new Stripe account or use existing test account
- [ ] Enable Connect platform (Settings > Connect)
- [ ] Enable Issuing (Settings > Issuing)
- [ ] Note down API keys (publishable and secret)
- [ ] Create webhook endpoint URL (will be your-domain.vercel.app/api/webhooks)

### Project Deployment
- [ ] Deploy to Vercel and share URL with attendees
- [ ] Test full flow once before meeting
- [ ] Prepare backup demo data in local storage

## 🏗️ Technical Architecture

```
Next.js 14 App Router
├── /app
│   ├── layout.tsx (Pluxee banner)
│   ├── page.tsx (Welcome/Overview)
│   ├── /onboarding
│   │   └── page.tsx (Connect embedded onboarding)
│   ├── /customer-dashboard
│   │   └── page.tsx (BNP Paribas view - balance & funding)
│   ├── /manage-cards
│   │   └── page.tsx (Create cardholders, cards, spending controls)
│   ├── /webhooks
│   │   └── page.tsx (Real-time event monitoring)
│   ├── /checkout
│   │   ├── /paul (Restaurant - MCC allowed)
│   │   ├── /uber (Transport - MCC allowed)
│   │   ├── /sephora (Beauty - MCC allowed)
│   │   └── /gas-station (Fuel - MCC blocked)
│   └── /api
│       ├── /connect-onboarding
│       ├── /create-cardholder
│       ├── /create-card
│       ├── /fund-account
│       └── /webhooks
├── /lib
│   ├── stripe.ts (Stripe configuration)
│   ├── config.ts (Demo data & settings)
│   └── storage.ts (Local storage utilities)
└── /components
    ├── Layout components
    ├── Stripe embedded components
    └── Demo utilities
```

# End-to-end flow

Qbit creates Stripe custom connected accounts for its users

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const account = await stripe.accounts.create({
  country: 'US',
  capabilities: {
    card_issuing: {
      requested: true,
    },
    card_payments: {
      requested: true,
    },
    transfers: {
      requested: true,
    },
  },
  type: 'custom',
  email: 'gtfoo+accounts1120@stripe.com',
  business_type: 'company',
  company: {
    address: {
      city: 'Company City',
      country: 'US',
      line1: 'address_full_match',
      line2: 'Company Address Line 2',
      postal_code: '123456',
      state: 'CA',
    },
    name: 'Company Name',
    phone: '+12025550168',
    registration_number: '123456A',
    structure: 'private_corporation',
    tax_id: '000000000',
  },
  business_profile: {
    mcc: '5977',
    name: 'Business Profile Name',
    product_description: 'Business Profile Product Description',
    support_address: {
      city: 'Business Profile City',
      country: 'US',
      line1: 'address_full_match',
      line2: 'Business Profile Address Line 2',
      postal_code: '12345',
      state: 'Business Profile State',
    },
    support_email: 'gtfoo+businessprofile@stripe.com',
    support_phone: '+6594596957',
    support_url: 'https://www.support.stripe.com',
    url: 'https://www.google.com',
  },
  external_account: {
    account_holder_name: 'Bank Account Holder Name',
    account_holder_type: 'individual',
    account_number: '000123456789',
    country: 'US',
    currency: 'usd',
    object: 'bank_account',
    routing_number: '110000000',
  },
  tos_acceptance: {
    date: 1689161040,
    ip: '11.11.11.11',
    service_agreement: 'full',
    user_agent: '',
  },
  settings: {
    card_issuing: {
      tos_acceptance: {
        date: 1689163680,
        ip: '11.11.11.11',
      },
    },
  },
});
```

Adding owners to the custom connected accounts.
For verification, to upload any image to the bank account on Stripe dashboard

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const person = await stripe.accounts.createPerson(
  'replace_with_your_account_id',
  {
    address: {
      city: 'Individual City',
      country: 'US',
      line1: 'address_full_match',
      line2: 'Individual Address Line 2',
      postal_code: '12345',
      state: 'CA',
    },
    dob: {
      day: 1,
      month: 1,
      year: 1990,
    },
    email: 'individual@xyzabc.com',
    first_name: 'Individual First Name',
    id_number: '000000000',
    last_name: 'Individual First Name',
    metadata: {

    },
    phone: '+6500000000',
    relationship: {
      director: true,
      executive: true,
      owner: true,
      percent_ownership: 100,
      representative: true,
      title: 'Founder',
    },
    documents: {
      passport: {
        files: ['file_identity_document_success'],
      },
    },
  }
);
```

Alternatively, Qbit can utilise Stripe-hosted onboarding flow to collect the KYC information

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const accountLink = await stripe.accountLinks.create({
  account: 'acct_1NcnOtPRH9jNnKKy',
  refresh_url: 'https://bob-tinker-123456789.stripedemos.com/scenario/3db5054f-7102-42b6-a139-1ebb44ab3a80?checkout_session={CHECKOUT_SESSION_ID}',
  return_url: 'https://bob-tinker-123456789.stripedemos.com/scenario/3db5054f-7102-42b6-a139-1ebb44ab3a80?checkout_session={CHECKOUT_SESSION_ID}',
  type: 'account_onboarding',
});
```

For pull funding, to first collect your users' information as an authorization of future debits, to prevent disputes.
First step is to tokenise the user's bank account

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const token = await stripe.tokens.create(
  {
    bank_account: {
      account_holder_name: 'Jenny Rosen',
      account_holder_type: 'individual',
      account_number: '000000000009',
      country: 'us',
      currency: 'usd',
      routing_number: '110000000',
    },
  },
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

Second step is to create a source bank account pointing to the token, and additional information about the bank account owner. Qbit should store the source ID generated, as this won't be attached to the Account object in Stripe

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const source = await stripe.sources.create({
  stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
});
```

Third step is to verify the microdeposit amounts Stripe would be sending to the source bank account. This would complete the authorization, acting as evidence should the user raise a dispute of unauthorized debits in the future

```text
Error while generating `node` snippet:

Failed to make typed arg for arg 'values' on method post /v1/sources/{source}/verify. Error: Error: Cannot make typed arg from RequestArg 'number' and StripeType 'primitive'. These are not compatible.
arg: {
  "shape": "number",
  "value": 32
}
type: {
  "shape": "primitive",
  "primitive": "string",
  "maxLength": 5000
}
```

Once authorization is completed, to initiate ACH debit from the user's bank account to their Stripe issuing balance.

Qbit can choose to receive email notifications should the user's issuing balance falls below a fixed amount or %.
https://dashboard.stripe.com/settings/issuing/balance-notifications

```text
Error while generating `node` snippet:

Bad input: POST /v1/topups requires amount, currency, but no args were provided
```

For push funding, to generate bank transaction instructions to be shown to the user so they can initiate a wire transfer or ACH credit to Stripe bank account. Once Stripe has received the fund after x days, Stripe would directly top up the user's Stripe issuing balance.

```text
Error while generating `node` snippet:

Method not found post /v1/issuing/funding_instructions
```

Create cardholder

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const cardholder = await stripe.issuing.cardholders.create(
  {
    billing: {
      address: {
        city: 'Individual City',
        country: 'US',
        line1: 'Individual Address Line 1',
        line2: 'Individual Address Line 2',
        postal_code: '12345',
        state: 'CA',
      },
    },
    name: 'Test Cardholder Name',
    email: 'gtfoo+cardholder1@stripe.com',
    phone_number: '+6594596957',
    individual: {
      card_issuing: {
        user_terms_acceptance: {
          date: 1689161040,
          ip: '11.11.11.11',
        },
      },
      dob: {
        day: 1,
        month: 1,
        year: 1990,
      },
      first_name: 'GT',
      last_name: 'Foo',
    },
  },
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

Issuing card to a cardholder

```text
Error while generating `node` snippet:

Bad input: POST /v1/issuing/cards requires currency, type, but no args were provided
```

To mark an active card as inactive, lost or stolen

```text
Error while generating `node` snippet:

Failed to make typed arg for arg 'cancellation_reason' on method post /v1/issuing/cards/{card}. Error: Error: There was no gated enum value 'cancellation_reason[]' and enum value '' is not in the type's list of enum values: ["lost","stolen"] 
```

To create a test authorization on dashboard at this stage, which a issuing_authorization.created webhook should be received

To approve (or decline) the authorization, this has to be completed within 2s of issuing_authorization.created webhook sent.
Otherwise, we would refer to the default setting here
https://dashboard.stripe.com/settings/issuing/authorizations

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const authorization = await stripe.issuing.authorizations.approve(
  'replace_with_your_authorization_id',
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

Create the dispute

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const dispute = await stripe.issuing.disputes.create(
  {
    evidence: {
      canceled: {

      },
      duplicate: {

      },
      fraudulent: {
        explanation: 'winning_evidence',
      },
      merchandise_not_as_described: {

      },
      not_received: {

      },
      other: {

      },
      reason: 'fraudulent',
      service_not_as_described: {

      },
    },
    transaction: 'ch_3RdqlzGRfksL1VFp1RO3NLpc',
  },
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

Submit the dispute

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const dispute = await stripe.issuing.disputes.submit(
  'replace_with_your_dispute_id',
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

Find out existing issuing balance

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const balance = await stripe.balance.retrieve();
```

List of balance transactions related to issuing transactions

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const balanceTransactions = await stripe.balanceTransactions.list(
  {
    type: 'issuing_transaction',
  },
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

List of balance transactions related to issuing disputes

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const balanceTransactions = await stripe.balanceTransactions.list(
  {
    type: 'issuing_transaction',
  },
  {
    stripeAccount: 'acct_1NcnOtPRH9jNnKKy',
  }
);
```

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const transactions = await stripe.issuing.transactions.list({
  card: '',
  cardholder: '',
});
```

```node
const stripe = require('stripe')('REPLACE_WITH_YOUR_SECRET_KEY');

const cards = await stripe.issuing.cards.list();
```



## 🎨 UI/UX Guidelines

### Visual Identity
- Use Pluxee banner image in layout.tsx
- Clean, professional design with Tailwind CSS
- Green accent color matching Pluxee branding (#00B894)
- Clear navigation between demo phases

### User Experience
- Pre-fill forms with demo data from config
- Clear success/error states
- Loading indicators for API calls
- Responsive design for different screen sizes

## 📊 Demo Data Configuration

```typescript
// lib/config.ts
export const DEMO_CONFIG = {
  companies: [
    {
      name: 'BNP Paribas',
      email: 'corporate@testparis.fr',
      employees: [
        {
          name: 'Olivia Dubois',
          email: 'olivia.dubois@testparis.fr',
          phone: '+33123456789'
        }
      ]
    }
  ],
  merchants: {
    allowed: [
      { name: 'Paul', mcc: '5812', category: 'restaurants' },
      { name: 'Uber', mcc: '4121', category: 'taxi_limousines' },
      { name: 'Sephora', mcc: '5977', category: 'cosmetic_stores' }
    ],
    blocked: [
      { name: 'Gas Station', mcc: '5541', category: 'gas_stations' }
    ]
  },
  spendingLimits: [
    { amount: 50000, interval: 'monthly' }, // €500/month
    { amount: 2500, interval: 'daily' }     // €25/day
  ]
};
```

## 🎤 Key Demo Talking Points

### Opening Hook
"Today we're going to build a complete corporate card platform in 2 hours. We'll follow Olivia Dubois, a BNP Paribas employee, from the moment her company onboards with Pluxee to making her first purchase with spending controls."

### Technical Highlights
- "This is production-ready code with just a few API calls"
- "Stripe handles all the regulatory complexity"
- "Real-time webhooks give you business intelligence"
- "Spending controls work across all payment methods"

### Business Value
- "Scale to thousands of enterprise clients with the same code"
- "Reduce fraud with granular MCC and spending controls"
- "Real-time monitoring improves customer support"
- "Embedded components reduce development time by 80%"

## 🚀 Deployment Commands

```bash
# Initialize project
npx create-next-app@latest pluxee-stripe-demo --typescript --tailwind --app
cd pluxee-stripe-demo

# Install Stripe dependencies
npm install stripe @stripe/stripe-js @stripe/react-connect-js

# Environment variables
echo "STRIPE_SECRET_KEY=sk_test_..." > .env.local
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..." >> .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env.local

# Deploy to Vercel
npx vercel --prod
```

## 🔧 Troubleshooting

### Common Issues
- **Webhook not firing**: Check endpoint URL in Stripe dashboard
- **Card creation fails**: Verify issuing is enabled and account has funds
- **Connect onboarding stuck**: Ensure correct return URLs
- **Local storage not persisting**: Check browser privacy settings

### Fallback Plans
- Pre-generated demo data in config file
- Screenshots of successful flows
- Video recording of working demo
- Postman collection with all API calls

## 📈 Success Metrics

### Immediate Goals
- [ ] All attendees understand Stripe's value proposition
- [ ] Technical team sees implementation simplicity
- [ ] Product team envisions customer use cases
- [ ] Clear next steps established for POC

### Follow-up Actions
- Share demo URL for continued exploration
- Provide API documentation and examples
- Schedule technical deep-dive session
- Create POC project timeline

---

**Remember**: Keep it simple, focus on business value, and let the code speak for itself. Stripe makes complex payment infrastructure look effortless!