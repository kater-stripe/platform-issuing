# 🏦 Platform Issuing Demo

A comprehensive demo application showcasing **Stripe Connect + Issuing** capabilities for building payment platforms with virtual card issuance.

## ✨ Features

### 🔗 Stripe Connect
- **Account Onboarding**: Streamlined business account creation
- **Balance Management**: Real-time balance tracking and funding
- **Connected Accounts**: Multi-tenant account management

### 💳 Stripe Issuing
- **Virtual Cards**: Instant card creation for employees
- **Spending Controls**: MCC-based restrictions and spending limits
- **Real-time Authorization**: 2-second webhook-based transaction approval
- **Transaction Monitoring**: Live transaction tracking and reporting

### 🎯 Demo Scenarios
- **Allowed Merchants**: Restaurants, Transportation, Cosmetics
- **Blocked Merchants**: Gas Stations, Gambling
- **Spending Limits**: £25/day, £500/month
- **Real-time Decisions**: Automatic approval/decline based on controls

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Stripe Account with Issuing enabled
- Stripe CLI (for local webhook forwarding)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/platform-issuing.git
cd platform-issuing
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Stripe keys:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up webhooks (local development)**
```bash
stripe listen --forward-to localhost:3000/api/webhooks --events issuing_authorization.request,issuing_authorization.created,issuing_authorization.updated,issuing_card.created,issuing_cardholder.created,issuing_transaction.created
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open the application**
Visit `http://localhost:3000`

## 🏗️ Architecture

### API Routes
- `/api/connect/*` - Stripe Connect operations
- `/api/issuing/*` - Card and cardholder management  
- `/api/checkout/*` - Payment authorization simulation
- `/api/webhooks` - Real-time webhook processing

### Key Components
- **Account Onboarding**: Connect embedded components
- **Card Management**: Issuing dashboard with spend controls
- **Transaction Simulation**: Mock merchant checkouts
- **Webhook Monitor**: Real-time event streaming

## 🔧 Configuration

### Spending Controls
Configure allowed/blocked merchant categories in `src/demo-config.ts`:

```typescript
mccCodes: {
  '5812': { name: 'Restaurants', allowed: true, icon: '🍽️' },
  '4121': { name: 'Taxi & Limousines', allowed: true, icon: '🚕' },
  '5977': { name: 'Cosmetic Stores', allowed: true, icon: '💄' },
  '5541': { name: 'Gas Stations', allowed: false, icon: '⛽' },
}
```

### Company Profiles
Add demo companies for onboarding:

```typescript
companies: [
  {
    name: 'Your Company',
    email: 'corporate@yourcompany.com',
    country: 'GB',
    business_type: 'company',
    employees: [...]
  }
]
```

## 🎭 Demo Flow

1. **Connect Onboarding** (`/onboarding`)
   - Select a demo company
   - Complete Stripe Connect onboarding
   - Account verification and activation

2. **Fund Issuing Balance** (`/customer-dashboard`)
   - Add funds to issuing balance
   - Monitor account status
   - View available balances

3. **Create Cards** (`/manage-cards`)
   - Add cardholders (employees)
   - Issue virtual cards
   - Configure spending controls

4. **Test Transactions** (`/checkout`)
   - Try different merchant scenarios
   - See real-time authorization decisions
   - Monitor webhook events

5. **Monitor Activity** (`/webhooks`)
   - Live webhook event stream
   - Authorization request/response details
   - Transaction history

## 🔍 Webhook Events

Critical events for real-time authorization:

```typescript
// Real-time authorization (must respond in <2s)
issuing_authorization.request

// Transaction lifecycle
issuing_authorization.created
issuing_authorization.updated
issuing_transaction.created

// Card management
issuing_card.created
issuing_cardholder.created
```

## 🛠️ Customization

### Adding New Merchants
1. Update `DEMO_CONFIG.merchants` in `src/demo-config.ts`
2. Add new checkout page in `src/app/checkout/`
3. Configure MCC code in spending controls

### Modifying Spending Limits
```typescript
// In card creation
spending_limits: [
  { amount: 50000, interval: 'monthly' }, // £500
  { amount: 2500, interval: 'daily' }     // £25
]
```

### Custom Authorization Logic
Modify `src/app/api/webhooks/route.ts` to implement custom approval rules:

```typescript
function handleAuthorizationRequest(authorization, account) {
  // Your custom logic here
  return { approved: true/false, reason: '...' };
}
```

## 🚀 Production Deployment

### Environment Setup
```bash
# Production environment variables
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Webhook Configuration
1. Create production webhook endpoint in Stripe Dashboard
2. Point to: `https://yourdomain.com/api/webhooks`
3. Enable required events (see above)
4. Update `STRIPE_WEBHOOK_SECRET` with production secret

### Deploy to Vercel
```bash
vercel --prod
```

## 📊 Monitoring

- **Stripe Dashboard**: Monitor transactions and account status
- **Application Logs**: Real-time webhook processing
- **Demo Dashboard**: Live transaction and authorization tracking

## 🔐 Security

- ✅ Webhook signature verification
- ✅ Environment variable protection  
- ✅ Secure API key handling
- ✅ Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Issuing Docs](https://stripe.com/docs/issuing)
- [GitHub Issues](https://github.com/YOUR_USERNAME/platform-issuing/issues)

---

**⚡ Built with Stripe Connect + Issuing | Next.js | TypeScript | Tailwind CSS**
