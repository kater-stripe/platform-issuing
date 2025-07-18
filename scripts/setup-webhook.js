#!/usr/bin/env node

/**
 * Setup Production Webhook Endpoint
 * 
 * This script creates a webhook endpoint in your Stripe account
 * pointing to your production URL with the necessary events.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupWebhook() {
  try {
    console.log('🔗 Setting up production webhook endpoint...');
    
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks',
      enabled_events: [
        'issuing_authorization.request',
        'issuing_authorization.created',
        'issuing_authorization.updated',
        'issuing_card.created',
        'issuing_cardholder.created',
        'issuing_transaction.created',
        'account.updated',
        'account.external_account.created'
      ],
      description: 'Stripe Demo Webhook - Real-time authorization and issuing events'
    });

    console.log('✅ Webhook endpoint created successfully!');
    console.log('📋 Webhook Details:');
    console.log(`   ID: ${webhookEndpoint.id}`);
    console.log(`   URL: ${webhookEndpoint.url}`);
    console.log(`   Secret: ${webhookEndpoint.secret}`);
    console.log('');
    console.log('🔐 IMPORTANT: Update your production environment variables:');
    console.log(`   STRIPE_WEBHOOK_SECRET=${webhookEndpoint.secret}`);
    console.log('');
    console.log('📝 Events configured:');
    webhookEndpoint.enabled_events.forEach(event => {
      console.log(`   - ${event}`);
    });

  } catch (error) {
    console.error('❌ Failed to create webhook endpoint:', error.message);
    
    if (error.code === 'url_invalid') {
      console.log('💡 Make sure your production URL is accessible and uses HTTPS');
    }
    
    if (error.code === 'resource_already_exists') {
      console.log('💡 Webhook endpoint already exists. Listing existing endpoints...');
      
      const endpoints = await stripe.webhookEndpoints.list();
      console.log('📋 Existing webhook endpoints:');
      endpoints.data.forEach(endpoint => {
        console.log(`   - ${endpoint.id}: ${endpoint.url}`);
      });
    }
  }
}

// Check if Stripe key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/setup-webhook.js');
  process.exit(1);
}

setupWebhook(); 