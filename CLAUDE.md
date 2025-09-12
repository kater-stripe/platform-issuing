# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **Pluxee SnackPack MVP Demo** - a Stripe Connect + Issuing application built with Next.js 13+ that showcases Pluxee's modernized tech stack for the SME benefits market. The project demonstrates how Pluxee can bypass traditional banking constraints to launch "SnackPack" - a multi-wallet benefits platform targeting SMEs with 50-500 employees in just 60 days instead of 18 months.

## Common Development Commands

```bash
# Development
npm run dev                    # Start development server on port 3000
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Webhook utilities
npm run webhook:setup          # Set up Stripe webhook endpoints
npm run webhook:list           # List configured webhooks  
npm run webhook:test           # Test webhook configuration
```

## Environment Setup

Required environment variables in `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture Overview

### Application Structure

The app follows Next.js 13+ App Router with the following key areas:

**SnackPack Demo Flow Pages:**
- `/onboarding` - TechStart London (SME) onboarding in 5 minutes vs 8 weeks with banks
- `/customer-dashboard` - SME-friendly funding (£2K minimum vs £50K bank requirements)
- `/manage-cards` - Sophie Martin gets multi-wallet SnackPack card (Meal/Transport/Wellness)
- `/webhooks` - Real-time benefit usage monitoring and compliance
- `/checkout/*` - SME employee scenarios (Business meals, Client transport, Wellness, Blocked purchases)

**API Routes:**
- `/api/connect/*` - Connect account management, onboarding, funding
- `/api/issuing/*` - Cardholder, card, and authorization management
- `/api/checkout/*` - Payment authorization and session handling
- `/api/webhooks` - Real-time webhook processing (critical for 2-second authorization response)

### Key Components

**Stripe Integration (`src/lib/stripe.ts`):**
- Centralized Stripe client with API version `2025-06-30.basil`
- Error handling with `safeStripeCall()` wrapper  
- `connectUtils` for SME onboarding (bypassing bank partnerships)
- `issuingUtils` for SnackPack multi-wallet card operations
- `webhookUtils` for real-time benefit authorization

**SnackPack Configuration (`src/demo-config.ts`):**
- SME companies (TechStart London, GreenSpark Media, HealthTech Solutions)
- Sophie Martin character and SME employee profiles
- Three benefit wallets: Meal (£15/day), Transport (£100/month), Wellness (£50/month)
- MCC definitions organized by wallet type
- Pluxee brand colors and UI constants
- UK SME market focus (GBP currency, London-based scenarios)

**Type Definitions (`src/lib/types.ts`):**
- Complete TypeScript interfaces for Stripe objects
- Demo-specific types for configuration and state management
- Form interfaces for UI components

### SnackPack Multi-Wallet Authorization System

The webhook handler implements **benefit-specific authorization** for SnackPack wallets:

1. **Multi-Wallet Authorization Flow:**
   - `issuing_authorization.request` events route to appropriate wallet (Meal/Transport/Wellness)
   - Checks wallet-specific MCC restrictions and spending limits
   - Real-time approval/decline within 2 seconds (vs bank batch processing)

2. **SME Benefit Scenarios:**
   - **Meal Wallet**: Business lunches, coffee meetings, team snacks
   - **Transport Wallet**: Client visits, conferences, business travel
   - **Wellness Wallet**: Gym memberships, health checkups, mental health
   - **Compliance Blocks**: Fuel, gambling, luxury purchases

3. **Pluxee's Competitive Advantage:**
   - Own transaction data (vs banks controlling insights)
   - Real-time benefit analytics for SME clients
   - API-driven wallet configuration (no bank policy delays)

## Development Patterns

### SnackPack API Patterns

Always use the error handling wrapper for SME operations:
```typescript
import { safeStripeCall, connectUtils } from '@/lib/stripe';
import { DEMO_CONFIG } from '@/src/demo-config';

// SME onboarding (5 minutes vs 8 weeks)
const result = await safeStripeCall(
  () => stripe.accounts.create({
    country: 'GB',
    capabilities: { card_issuing: { requested: true } },
    // Use TechStart London SME profile
    ...DEMO_CONFIG.companies[0]
  }),
  'createSMEAccount'
);
```

### Connected Account Context

Use `stripeAccount` parameter for all issuing operations:
```typescript
const options = { stripeAccount: accountId };
await stripe.issuing.cards.create(cardParams, options);
```

### SnackPack Demo Data Usage

Pre-fill forms with SME-focused data:
```typescript
import { DEMO_CONFIG } from '@/src/demo-config';

// Use Sophie Martin as demo employee
const defaultEmployee = DEMO_CONFIG.sophie;
const defaultSME = DEMO_CONFIG.companies[0]; // TechStart London

// Configure multi-wallet SnackPack card
const snackPackConfig = DEMO_CONFIG.defaults.snackPackCard;
```

### Local Storage for Demo State

The app uses localStorage to persist demo state across sessions:
- Connected account IDs mapped by company email
- Cardholder and card relationships
- Current user context

## Key Business Logic

### SnackPack Benefit Wallet Controls

Configured by wallet type in `DEMO_CONFIG.mccCodes`:
- **Meal Wallet:** Restaurants (5812), Fast Food (5814), Food Stores (5499)
- **Transport Wallet:** Taxi/Uber (4121), Public Transport (4111), Bus Lines (4131)  
- **Wellness Wallet:** Fitness (7997), Pharmacy (5912), Health Spas (7298)
- **Blocked:** Gas Stations (5541), Gambling (7995), Luxury Retail (5311)

### SnackPack Wallet Limits (SME-Optimized)

Designed for SME employee benefits:
- **Meal Wallet:** £15/day, £325/month (21.5 working days)
- **Transport Wallet:** £100/month (client meetings, conferences)
- **Wellness Wallet:** £50/month (gym, health, wellbeing)
- **Total SnackPack Value:** ~£475/month per employee

### Webhook Events

Critical events monitored in real-time:
- `issuing_authorization.request` - Must respond within 2 seconds
- `issuing_authorization.created/updated` - Authorization lifecycle
- `issuing_card.created` - New card issued
- `issuing_cardholder.created` - New cardholder added
- `issuing_transaction.created` - Transaction completed

## Testing

### Webhook Testing

Use Stripe CLI for local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks --events issuing_authorization.request,issuing_authorization.created,issuing_authorization.updated,issuing_card.created,issuing_cardholder.created,issuing_transaction.created
```

### Authorization Testing

Test different scenarios via `/api/issuing/test-authorization`:
- `paul-success` - Approved restaurant transaction
- `gas-station-blocked` - Declined gas station (MCC block)  
- `high-amount-declined` - Declined for exceeding limits

### Demo Flow Testing

1. Complete Connect onboarding with Test London Ltd
2. Fund issuing balance via customer dashboard
3. Create Olivia Dubois as cardholder with spending controls
4. Test transactions across different merchant scenarios
5. Monitor real-time webhooks during authorization

## Important Files

- `src/demo-config.ts` - SnackPack configuration, SME profiles, wallet definitions
- `src/lib/stripe.ts` - Stripe client optimized for SME operations
- `src/lib/types.ts` - SnackPack and SME-specific TypeScript interfaces
- `src/app/api/webhooks/route.ts` - Multi-wallet benefit authorization handler
- `STORY.md` - Complete SnackPack demo script following D-E-M-O structure
- `tailwind.config.js` - Pluxee brand colors and wallet-specific styling
- `.cursor/rules.mdc` - SME-focused development guidelines
- `README.md` - SnackPack setup and SME market positioning

## Deployment Notes

- **Branch:** `sa-summit-pluxee` - Pluxee-specific demo version
- Uses Vercel for hosting with Pluxee branding
- Webhook endpoint configured for multi-wallet authorization
- SME market focus: UK/London scenarios, GBP currency, startup-friendly amounts
- **Business Context:** 60-day MVP vs 18-month traditional banking timelines
- Test mode with Pluxee brand colors and SnackPack messaging throughout