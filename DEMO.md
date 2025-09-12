# Demo Capabilities

This **Stripe Connect + Issuing Demo** is a comprehensive platform that showcases how to build a corporate card program with real-time spending controls. Here are its key capabilities:

## 🏢 Business Onboarding (Stripe Connect)

**Corporate Account Creation:**
- Businesses like "Test London Ltd" can onboard through Stripe's embedded components
- Complete KYC verification and regulatory compliance handled by Stripe
- Supports UK businesses with proper tax IDs and address validation
- Creates connected accounts with issuing and payment capabilities

**Account Management:**
- Real-time account status monitoring
- Balance tracking across different currencies (GBP focused)
- Funding simulation for issuing balance top-ups

## 💳 Virtual Card Issuance

**Employee Card Management:**
- Create cardholders (employees like "Olivia Dubois") 
- Issue virtual cards instantly with unique card numbers
- Support for physical cards (framework ready)
- Card status management (active/inactive/canceled)

**Spending Controls:**
- **MCC Restrictions:** Allow restaurants, taxis, cosmetics; block gas stations, gambling
- **Spending Limits:** Daily (£250) and monthly (£5000) limits per card
- **Category-based Controls:** Fine-grained merchant category permissions
- **Real-time Enforcement:** All controls applied immediately

## ⚡ Real-time Authorization Engine

**2-Second Decision Making:**
- Receives `issuing_authorization.request` webhooks from Stripe
- Evaluates spending controls and MCC restrictions in real-time  
- Responds with approve/decline within Stripe's 2-second requirement
- Custom decline reasons (spending_controls, blocked_merchant, etc.)

**Authorization Scenarios:**
- ✅ **Approved:** Paul (restaurant) £6.50 purchase
- ❌ **Declined:** Gas station transaction (MCC 5541 blocked)
- ❌ **Declined:** £300 transaction exceeding daily limit
- ⚡ **Partial:** Fuel pre-authorization with controllable amounts

## 🛒 Merchant Checkout Simulation

**Realistic Transaction Testing:**
- **Paul Bakery:** Restaurant purchases (croissants, coffee) - MCC 5812
- **Uber:** Ride-sharing services (UberX, Pool) - MCC 4121  
- **Sephora:** Beauty products (lipstick, perfume) - MCC 5977
- **Gas Station:** Fuel purchases (blocked) - MCC 5541
- **Casino:** Gambling (blocked) - MCC 7995

**Transaction Processing:**
- Creates real Stripe authorization objects via test helpers
- Triggers actual webhook events for realistic testing
- Processes payments with proper merchant data
- Handles success/failure scenarios with user feedback

## 📊 Real-time Monitoring Dashboard

**Live Event Streaming:**
- Webhook event monitoring in real-time
- Authorization request/response tracking
- Transaction lifecycle visibility
- Processing time metrics (ensures sub-2-second responses)

**Business Intelligence:**
- Spending pattern analysis
- Authorization success/failure rates
- Employee spending behavior
- Merchant category breakdowns

## 🎯 Demo Flow Orchestration

**Complete End-to-End Journey:**
1. **Setup** → Stripe dashboard configuration  
2. **Onboarding** → Business account creation via Connect
3. **Funding** → Add money to issuing balance
4. **Card Creation** → Issue cards to employees with controls
5. **Testing** → Try transactions across different merchants
6. **Monitoring** → Watch real-time authorization decisions

**Multiple User Scenarios:**
- Different employee roles (standard, manager, executive)
- Varying spending limits based on seniority
- Multiple companies can onboard simultaneously
- Persistent demo state via localStorage

## 🔧 Technical Capabilities

**Production-Ready Features:**
- Webhook signature verification for security
- Proper error handling and fallbacks  
- TypeScript throughout for type safety
- Responsive design for mobile/desktop
- Real Stripe API integration (not mocked)

**Developer Experience:**
- Pre-configured demo data for quick testing
- One-click form population with realistic data
- Clear success/error states and loading indicators
- Comprehensive logging for debugging
- Easy merchant scenario switching

## 🌍 Market Configuration

**UK-Focused Implementation:**
- GBP currency throughout
- UK address formats and postal codes
- British phone number formats
- UK business registration requirements
- London-based demo scenarios

## 🎪 Live Demo Scenarios

### Scenario 1: Successful Restaurant Purchase
**Story:** Olivia needs lunch during a business meeting
- **Merchant:** Paul Bakery (MCC 5812 - Restaurant)
- **Amount:** £8.50 (Caesar salad + coffee)
- **Result:** ✅ Approved (within daily limit, allowed category)
- **Timing:** Authorization decision in <500ms

### Scenario 2: Blocked Gas Station
**Story:** Olivia tries to fuel up the company car
- **Merchant:** Gas Station (MCC 5541 - Service Stations)
- **Amount:** £65.00 (fuel)
- **Result:** ❌ Declined (blocked merchant category)
- **Reason:** Company policy blocks gas station purchases

### Scenario 3: Spending Limit Exceeded
**Story:** Olivia attempts a large cosmetics purchase
- **Merchant:** Sephora (MCC 5977 - Cosmetic Stores)
- **Amount:** £300.00 (designer perfume set)
- **Result:** ❌ Declined (exceeds daily limit of £250)
- **Reason:** spending_controls - daily limit exceeded

### Scenario 4: Approved Business Travel
**Story:** Olivia needs transportation to client meeting
- **Merchant:** Uber (MCC 4121 - Taxi/Limousines)
- **Amount:** £16.50 (UberX across London)
- **Result:** ✅ Approved (within limits, allowed category)
- **Business Value:** Employee mobility enabled

### Scenario 5: Gambling Block
**Story:** Weekend entertainment attempt
- **Merchant:** Casino (MCC 7995 - Gambling)
- **Amount:** £100.00 (casino chips)
- **Result:** ❌ Declined (prohibited category)
- **Reason:** Corporate compliance policy

## 📈 Business Value Demonstration

**For Enterprise Clients (like BNP Paribas):**
- **Instant Deployment:** Cards issued in minutes, not days
- **Granular Control:** MCC-level restrictions + spending limits
- **Real-time Monitoring:** Every transaction visible immediately
- **Compliance Ready:** Stripe handles all regulatory requirements
- **Scalable:** Support thousands of employees with same infrastructure

**For Payment Platforms (like Pluxee):**
- **White Label Solution:** Fully customizable UX/branding
- **Revenue Opportunities:** Interchange fees + platform fees
- **Reduced Development:** 80% less code vs building from scratch
- **Global Reach:** Stripe's 46+ country support
- **Enterprise Grade:** Built-in fraud protection + dispute management

This demo effectively shows how a company like Pluxee could offer corporate card programs to enterprise clients, with Stripe handling all the complex payment infrastructure, regulatory compliance, and real-time authorization processing.