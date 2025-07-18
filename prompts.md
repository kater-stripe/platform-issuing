# Pluxee x Stripe Demo - Live Coding Prompts

> **Copy-paste these prompts step by step during your live demo**

Each prompt is designed to work with Cursor + the existing demo project structure. The prompts will implement real Stripe Connect + Issuing functionality using UK configuration and the Huel/Olivia Dubois story.

**Current Project State:**
- ✅ Next.js project with demo shell UI and navigation
- ✅ Demo config with UK Huel and Olivia Dubois data
- ✅ Cursor rules for French-first Stripe patterns
- ✅ Basic page structure ready for implementation
- ❌ Stripe dependencies and API integration (to be added)

---

## 🛠️ Phase 1: Foundation & Stripe Setup (5 min)

### Prompt 1.1: Install Stripe Dependencies & Create Core Utilities
```
I need to set up Stripe Connect and Issuing for a French demo. Install dependencies and create core utilities:

1. Install: stripe, @stripe/stripe-js, @stripe/react-connect-js
2. Create src/lib/stripe.ts with French-configured Stripe client (apiVersion: '2024-06-20')
3. Create src/lib/storage.ts for demo state management (connected accounts, cardholders, cards)
4. Create src/lib/types.ts with TypeScript interfaces for demo data
5. Use environment variables: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET

Follow @french-configuration-standards from .cursor/rules. All Stripe operations should default to country: 'FR', currency: 'eur'.
```

### Prompt 1.2: Verify Environment & Project Structure
```
Check and set up the complete project structure:
- Verify .env.local has Stripe test keys
- Ensure src/app/api/ directories exist for: /connect/onboarding, /connect/balance, /issuing/cardholders, /issuing/cards, /webhooks
- Confirm demo-config.ts has UK Huel data
- Test basic Stripe connection with a simple balance check

If anything is missing, create the necessary files and directories using @project-structure patterns.
```

---

## 🏢 Phase 2: Connect Account Creation & Onboarding (15 min)

### Prompt 2.1: Implement French Connect Account Creation API
```
Create src/app/api/connect/onboarding/route.ts to create French connected accounts:

Use this Stripe pattern for France:
```javascript
const account = await stripe.accounts.create({
  country: 'FR',
  capabilities: {
    transfers: {
      requested: true,
    },
  },
  controller: {
    stripe_dashboard: {
      type: 'none',
    },
    fees: {
      payer: 'application',
    },
    losses: {
      payments: 'application',
    },
    requirement_collection: 'application',
  },
});
```

Then create account link for hosted onboarding. Use demo-config.ts for Barclays data. Store account ID in localStorage.
```

### Prompt 2.2: Create Hosted Onboarding Flow
```
Update src/app/onboarding/page.tsx to implement Stripe hosted onboarding:

1. Call the onboarding API to create account and get hosted onboarding URL
2. Use this pattern for account links:
```javascript
const accountLink = await stripe.accountLinks.create({
  account: accountId,
  refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?refresh=true`,
  return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/customer-dashboard?setup=complete`,
  type: 'account_onboarding',
});
```

3. Pre-populate with Barclays data from demo-config.ts
4. Show loading states and redirect to Stripe hosted onboarding
5. Handle return flow with success message
6. Use @ui-ux-guidelines for consistent styling

Reference: https://docs.stripe.com/connect/hosted-onboarding
```

---

## 💰 Phase 3: Balance Management & Funding (15 min)

### Prompt 3.1: Create Customer Dashboard with Balance Display
```
Create src/app/customer-dashboard/page.tsx to show connected account status:

1. Display Barclays company info from demo-config.ts
2. Show current issuing balance using balance API
3. Add funding simulation button (€1000 topup)
4. Display account capabilities and status
5. Link to card management when ready
6. Use @demo-flow-orchestration patterns for navigation

Show account details, balance, and clear next steps for the demo flow.
```

### Prompt 3.2: Implement Balance Retrieval and Funding APIs
```
Create two API endpoints:

1. src/app/api/connect/balance/route.ts:
```javascript
const balance = await stripe.balance.retrieve({
  stripeAccount: accountId
});
```

2. src/app/api/connect/funding/route.ts for demo funding:
Use Stripe test helper to fund issuing balance:
```javascript
const topup = await stripe.testHelpers.issuing.fundBalance({
  amount: 100000, // €1000 in cents
  currency: 'eur'
}, {
  stripeAccount: accountId
});
```

Both should:
- Use stripeAccount parameter for connected account context
- Follow @stripe-integration-patterns for error handling
- Return formatted Euro amounts
- Update localStorage with funding status

Reference: https://docs.stripe.com/api/balance and test helpers documentation
```

---

## 💳 Phase 4: Cardholder & Card Creation (25 min)

### Prompt 4.1: Create Cardholder Management Page
```
Create src/app/manage-cards/page.tsx with cardholder creation:

1. Form to create cardholder using Olivia Dubois data from demo-config.ts
2. "Use Olivia's Data" button for quick demo setup
3. Display existing cardholders from localStorage
4. Show card creation section after cardholder exists
5. Display created cards with spending controls
6. Use @form-patterns for prefilled data

Include cardholder creation form with French address format from demo-config.ts.
```

### Prompt 4.2: Implement Cardholder Creation API
```
Create src/app/api/issuing/cardholders/route.ts:

Use this French cardholder pattern:
```javascript
const cardholder = await stripe.issuing.cardholders.create({
  billing: {
    address: {
      city: 'Paris',
      country: 'FR',
      line1: '16 Boulevard des Italiens',
      postal_code: '75009',
      state: 'Île-de-France',
    },
  },
  name: 'Olivia Dubois',
  email: 'olivia.dubois@testparis.fr',
  phone_number: '+33123456789',
  individual: {
    card_issuing: {
      user_terms_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: '127.0.0.1',
      },
    },
    dob: {
      day: 15,
      month: 6,
      year: 1985,
    },
    first_name: 'Olivia',
    last_name: 'Dubois',
  },
}, {
  stripeAccount: accountId,
});
```

Store cardholder ID in localStorage and return success. Use demo-config.ts for Olivia's data.
```

### Prompt 4.3: Add Card Creation with MCC-Based Spending Controls
```
Update manage-cards page to add card creation functionality:

1. Form to create virtual cards for selected cardholder
2. Spending controls from demo-config.ts:
   - Monthly limit: €500 (50000 cents)
   - Daily limit: €25 (2500 cents)
   - Allowed categories: restaurants, taxi_limousines, cosmetic_stores
   - Blocked categories: gas_stations
3. Display created cards with spending limits
4. Show card details: last4, expiration, limits

Use MCC codes from demo-config.ts: Paul (5812), Uber (4121), Sephora (5977) allowed; Gas stations (5541) blocked.
```

### Prompt 4.4: Implement Card Creation with Spending Controls API
```
Create src/app/api/issuing/cards/route.ts:

Use this pattern for French cards with spending controls:
```javascript
const card = await stripe.issuing.cards.create({
  cardholder: cardholderId,
  currency: 'eur',
  type: 'virtual',
  spending_controls: {
    spending_limits: [
      {
        amount: 50000, // €500 monthly
        interval: 'monthly'
      },
      {
        amount: 2500, // €25 daily  
        interval: 'daily'
      }
    ],
    allowed_categories: ['restaurants', 'taxi_limousines', 'cosmetic_stores'],
    blocked_categories: ['gas_stations']
  }
}, {
  stripeAccount: accountId,
});
```

Store card data in localStorage and return card details including last4. Use @mcc-spending-controls patterns.

Reference: https://docs.stripe.com/issuing/controls/spending-controls
```

---

## 📡 Phase 5: Real-time Webhook Monitoring (15 min)

### Prompt 5.1: Implement Webhook Event Handler
```
Create src/app/api/webhooks/route.ts for real-time event monitoring:

```javascript
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle issuing and connect events
    switch (event.type) {
      case 'issuing_authorization.created':
        console.log('🔒 Authorization created:', event.data.object.id);
        break;
      case 'issuing_authorization.updated':
        console.log('🔄 Authorization updated:', event.data.object.id);
        break;
      case 'issuing_card.created':
        console.log('💳 Card created:', event.data.object.id);
        break;
      case 'issuing_cardholder.created':
        console.log('👤 Cardholder created:', event.data.object.id);
        break;
      case 'account.updated':
        console.log('🏢 Account updated:', event.data.object.id);
        break;
    }
    
    // Store events in localStorage for demo display
    
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
```

Use @webhook-handler-pattern for proper signature verification and event storage.
```

### Prompt 5.2: Create Real-time Events Dashboard
```
Create src/app/webhooks/page.tsx for real-time event monitoring:

1. Display webhook events from localStorage
2. Auto-refresh every 5 seconds or use polling
3. Show event types with icons: 💳 cards, 👤 cardholders, ⚡ authorizations, 🏢 accounts
4. Display timestamp, event type, and relevant data
5. Filter to show only relevant events from demo-config.ts relevantWebhookEvents
6. Add manual refresh button
7. Use @webhook-patterns for event display

This helps show real-time activity during issuing transactions simulation.
```

---

## 🛒 Phase 6: Issuing Transactions Simulation with MCC Controls (20 min)

### Prompt 6.1: Create Merchant Checkout Scenarios
```
Create checkout pages for testing MCC-based spending controls:

1. src/app/checkout/paul/page.tsx (Restaurant - MCC 5812, ALLOWED)
2. src/app/checkout/uber/page.tsx (Transport - MCC 4121, ALLOWED)  
3. src/app/checkout/sephora/page.tsx (Cosmetics - MCC 5977, ALLOWED)
4. src/app/checkout/gas-station/page.tsx (Gas Station - MCC 5541, BLOCKED)

Each page should:
- Display merchant info from demo-config.ts (name, logo, products)
- Show MCC code and allowed/blocked status clearly
- Include simple payment form for testing
- Use visual indicators: ✅ for allowed, ❌ for blocked
- Display product prices in euros

Use merchant data from demo-config.ts with realistic French pricing.
```

### Prompt 6.2: Implement Authorization Testing API
```
Create src/app/api/checkout/authorize/route.ts for testing card authorizations:

Use Stripe test helpers to simulate authorizations:
```javascript
// Test authorization with specific MCC
const authorization = await stripe.testHelpers.issuing.createAuthorization({
  amount: amount, // in cents
  currency: 'eur',
  card: cardId,
  merchant_data: {
    category: mccCode, // '5812' for restaurants, '5541' for gas stations
    name: merchantName,
    city: 'Paris',
    country: 'FR'
  }
}, {
  stripeAccount: accountId
});
```

The API should:
- Accept merchant MCC and amount
- Test against card's spending controls
- Return authorization result (approved/declined)
- Show decline reason for blocked MCCs
- Store transaction simulation in localStorage

Reference: https://docs.stripe.com/issuing/testing#test-authorizations
```

### Prompt 6.3: Create Checkout Hub with Test Scenarios
```
Create src/app/checkout/page.tsx as the main testing dashboard:

1. Grid of merchant cards from demo-config.ts showing:
   - Merchant name and logo
   - MCC code and category
   - Allowed/Blocked status with clear visual indicators
   - Sample products with Euro pricing
2. Current card info display (if card exists)
3. "Test All Scenarios" button for automated testing
4. Recent authorization attempts with results
5. Links to individual merchant checkout pages

Use demo-config.ts merchants data. Show clear success/failure states for each MCC category.
```

---

## 🎨 Phase 7: Authorization Handling & Real-time Updates (15 min)

### Prompt 7.1: Add Authorization Approval/Decline Logic
```
Create src/app/api/issuing/authorize/route.ts for handling authorization decisions:

```javascript
// Approve authorization (must be within 2 seconds of creation)
const authorization = await stripe.issuing.authorizations.approve(
  authorizationId,
  {
    stripeAccount: accountId,
  }
);

// Or decline with reason
const authorization = await stripe.issuing.authorizations.decline(
  authorizationId,
  {
    reason: 'spending_controls', // For MCC violations
    stripeAccount: accountId,
  }
);
```

Add real-time authorization monitoring:
1. Listen for issuing_authorization.created webhooks
2. Auto-approve allowed MCC transactions
3. Auto-decline blocked MCC transactions  
4. Show authorization decisions in real-time
5. Update webhook dashboard with authorization results

This demonstrates Stripe's 2-second authorization window and spending controls.
```

### Prompt 7.2: Enhanced Real-time Demo Features
```
Enhance the demo with better real-time features:

1. Add Server-Sent Events (SSE) for real-time webhook updates
2. Create src/app/api/events/route.ts for SSE endpoint
3. Auto-refresh authorization results across browser tabs
4. Show live transaction feed during issuing transactions simulation
5. Add sound notifications for demo effect (optional)
6. Display authorization timing (show the 2-second window)

This makes the demo more engaging and shows Stripe's real-time capabilities.
```

---

## 🎤 Phase 8: Demo Polish & Presentation Features (10 min)

### Prompt 8.1: Add Demo Storytelling Elements
```
Enhance the demo with narrative elements for the Olivia Dubois story:

1. Add welcome message about Barclays and Olivia
2. Step-by-step narrative text in each demo phase
3. Business value explanations in the UI
4. Success messages that advance the story
5. Clear call-to-action buttons for next steps
6. Demo progress indicator showing completion

Use the narrative from project.md: "Follow Olivia Dubois from card creation to making purchases with MCC-based restrictions."
```

### Prompt 8.2: Create Demo Control Dashboard
```
Enhance src/app/settings/page.tsx as a presenter control panel:

1. Demo progress tracking (which steps completed)
2. Quick reset button for demo state
3. Pre-populate demo data buttons
4. Manual webhook event triggers for demo
5. Account/cardholder/card status indicators
6. Quick links to each demo phase
7. Demo data export/import for backup

This helps manage the demo during the live presentation and provides fallback options.
```

---

## 🔧 Phase 9: Error Handling & Fallback Features (5 min)

### Prompt 9.1: Add Robust Error Handling for Live Demo
```
Enhance error handling across all components:

1. Network timeout handling with user-friendly messages
2. Stripe API rate limit handling with retry logic
3. Missing data validation before API calls
4. Fallback demo mode with simulated data
5. Clear error messages in French
6. Recovery options for failed operations

Add to all API routes:
```javascript
try {
  // Stripe operation
} catch (error) {
  console.error('Stripe Error:', error);
  if (error.code === 'rate_limit') {
    return { success: false, error: 'Veuillez patienter et réessayer' };
  }
  return { 
    success: false, 
    error: 'Une erreur est survenue. Veuillez réessayer.' 
  };
}
```

Use @live-demo-best-practices for error recovery patterns.
```

### Prompt 9.2: Create Demo Testing & Verification
```
Add comprehensive demo testing:

1. Create demo flow verification checklist
2. Test complete user journey: onboarding → dashboard → cards → payments → webhooks
3. Verify all French data is properly formatted
4. Test authorization timing and MCC controls
5. Verify localStorage persistence across browser sessions
6. Test mobile responsiveness
7. Add demo data validation

Create a /test-demo page that validates the complete demo flow works correctly.
```

---

## 🚀 Phase 10: Final Demo Optimization (5 min)

### Prompt 10.1: Optimize for Live Presentation
```
Final optimizations for smooth live demo:

1. Add demo data presets for one-click setup
2. Preload Stripe.js for faster loading
3. Add helpful console logs for audience
4. Ensure smooth transitions between demo phases
5. Add presenter notes as code comments
6. Test complete flow with timing
7. Add backup demo data in case of issues

Focus on making the demo flow smoothly without technical hiccups.
```

### Prompt 10.2: Create Demo Documentation
```
Create final demo documentation:

1. Update README.md with demo instructions
2. Add environment variable setup guide
3. Create demo script with timing estimates
4. Document all API endpoints and their purposes
5. Add troubleshooting guide for common issues
6. Create deployment checklist for Vercel
7. Add Stripe dashboard configuration steps

This ensures the demo can be reproduced and shared with the Pluxee team.
```

---

## 🎯 Quick Reference: Key API Patterns

### French Connected Account Creation
```javascript
const account = await stripe.accounts.create({
  country: 'FR',
  capabilities: { card_issuing: { requested: true } },
  business_type: 'company',
  // ... French business data
});
```

### French Cardholder Creation
```javascript
const cardholder = await stripe.issuing.cardholders.create({
  name: 'Olivia Dubois',
  email: 'olivia.dubois@testparis.fr',
  billing: { address: { country: 'FR', city: 'Paris' } },
  // ... French individual data
}, { stripeAccount: accountId });
```

### Card with MCC Controls
```javascript
const card = await stripe.issuing.cards.create({
  cardholder: cardholderId,
  currency: 'eur',
  spending_controls: {
    allowed_categories: ['restaurants', 'taxi_limousines'],
    blocked_categories: ['gas_stations']
  }
}, { stripeAccount: accountId });
```

### Test Authorization
```javascript
const auth = await stripe.testHelpers.issuing.createAuthorization({
  amount: 2500, // €25
  currency: 'eur',
  card: cardId,
  merchant_data: { category: '5812' } // Restaurant MCC
}, { stripeAccount: accountId });
```

---

## 📋 Demo Flow Checklist

**Phase 1:** ✅ Stripe setup and utilities  
**Phase 2:** ✅ Connect account creation and onboarding  
**Phase 3:** ✅ Balance display and funding simulation  
**Phase 4:** ✅ Cardholder and card creation with controls  
**Phase 5:** ✅ Real-time webhook monitoring  
**Phase 6:** ✅ Issuing transactions simulation with MCC controls  
**Phase 7:** ✅ Authorization handling  
**Phase 8:** ✅ Demo polish and storytelling  
**Phase 9:** ✅ Error handling and fallbacks  
**Phase 10:** ✅ Final optimization and documentation  

**🎯 Ready for live demo with Pluxee team!**