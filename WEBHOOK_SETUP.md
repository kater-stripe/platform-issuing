# 🔗 Webhook Setup Guide

This guide will help you set up webhook endpoints for your Pluxee production environment.

## 🚨 Critical: Real-time Authorization Webhooks

Your app handles **real-time authorization requests** that must respond within **2 seconds**. This is critical for the `issuing_authorization.request` event.

## 📋 Current Status

✅ **Webhook Handler**: Implemented at `/api/webhooks/route.ts`  
❌ **Production Endpoint**: Not registered in Stripe Dashboard  
❌ **Production Secret**: Not configured

## 🛠️ Setup Methods

### Method 1: Automated Setup (Recommended)

1. **Run the setup script**:
```bash
# Using your Stripe secret key
STRIPE_SECRET_KEY=sk_test_your_key npm run webhook:setup
```

2. **Copy the webhook secret** from the output and add it to your production environment variables.

### Method 2: Manual Setup via Stripe Dashboard

1. **Go to Stripe Dashboard** → [Webhooks](https://dashboard.stripe.com/webhooks)

2. **Click "Add endpoint"**

3. **Configure the endpoint**:
   - **Endpoint URL**: `https://platform-issuing.vercel.app/api/webhooks`
   - **Description**: `Webhook - Real-time authorization and issuing events`

4. **Select these events** (critical for your app):
   ```
   ⚠️  issuing_authorization.request  (CRITICAL - 2s response time)
   •   issuing_authorization.created
   •   issuing_authorization.updated
   •   issuing_card.created
   •   issuing_cardholder.created
   •   issuing_transaction.created
   •   account.updated
   •   account.external_account.created
   ```

5. **Save and copy the webhook secret**

## 🔐 Environment Configuration

### For Vercel Deployment

Add these environment variables to your Vercel project:

```bash
# Vercel Environment Variables
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
NEXT_PUBLIC_APP_URL=https://platform-issuing.vercel.app
```

### For Local Development

Your `.env.local` should contain:

```bash
# Development webhook secret (different from production)
STRIPE_WEBHOOK_SECRET=whsec_your_development_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing Your Webhook

### 1. List Current Webhooks
```bash
STRIPE_SECRET_KEY=sk_test_your_key npm run webhook:list
```

### 2. Test Webhook Endpoint
```bash
# Test if your endpoint is accessible
curl -X GET https://platform-issuing.vercel.app/api/webhooks
```

### 3. Monitor Webhook Events
- Visit your app at `https://platform-issuing.vercel.app/webhooks`
- Create test transactions to see events flow

### 4. Check Stripe Dashboard
- Go to [Webhook Logs](https://dashboard.stripe.com/webhooks) in Stripe Dashboard
- Monitor delivery attempts and response codes

## ⚠️ Critical Authorization Flow

Your webhook handler includes special logic for `issuing_authorization.request`:

```typescript
case 'issuing_authorization.request':
  // CRITICAL: Must respond within 2 seconds
  const authorizationResult = await handleAuthorizationRequest(
    event.data.object, 
    event.account
  );
  // Approves or declines in real-time
  break;
```

**This event type requires immediate response** - any delays will result in declined transactions.

## 🔍 Troubleshooting

### No Events Received
1. ✅ Verify webhook URL: `https://platform-issuing.vercel.app/api/webhooks`
2. ✅ Check webhook secret matches production environment
3. ✅ Ensure all required events are selected
4. ✅ Verify your app is deployed and accessible

### Authorization Events Not Working
1. ✅ Ensure `issuing_authorization.request` is enabled
2. ✅ Check response time is under 2 seconds
3. ✅ Verify Stripe account has issuing enabled
4. ✅ Test with small amounts first

### Event Signature Verification Fails
1. ✅ Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint secret
2. ✅ Check for trailing whitespace in environment variables
3. ✅ Verify raw request body is used (not parsed JSON)

### Response Timeouts
1. ✅ Move complex logic after returning 200 response
2. ✅ Use asynchronous processing for non-critical operations
3. ✅ Monitor webhook processing time

## 📊 Monitoring

### Webhook Dashboard
Visit `https://pluxee-two.vercel.app/webhooks` to see:
- Recent webhook events
- Processing status
- Authorization decisions
- Event types and timing

### Stripe Dashboard
Monitor at [Webhooks](https://dashboard.stripe.com/webhooks):
- Delivery success/failure rates
- Response times
- Retry attempts
- Event details

## 🛡️ Security Best Practices

1. **Always verify webhook signatures**
2. **Use HTTPS endpoints only**
3. **Implement proper error handling**
4. **Log webhook events for debugging**
5. **Use different secrets for test/live modes**
6. **Monitor for replay attacks**

## 📞 Support

If webhooks still aren't working:

1. Check the [Stripe Webhook Docs](https://stripe.com/docs/webhooks)
2. Review webhook logs in Stripe Dashboard
3. Test with the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks`

---

## Quick Commands Reference

```bash
# List current webhooks
npm run webhook:list

# Set up production webhook
STRIPE_SECRET_KEY=sk_live_... npm run webhook:setup

# Test webhook configuration
npm run webhook:test

# Test endpoint accessibility
curl https://platform-issuing.vercel.app/api/webhooks
```