#!/usr/bin/env node

/**
 * List and Manage Webhook Endpoints
 * 
 * This script lists all webhook endpoints in your Stripe account
 * and shows their configuration.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function listWebhooks() {
  try {
    console.log('📋 Listing webhook endpoints...\n');
    
    const endpoints = await stripe.webhookEndpoints.list();
    
    if (endpoints.data.length === 0) {
      console.log('❌ No webhook endpoints found.');
      console.log('💡 Run: node scripts/setup-webhook.js to create one');
      return;
    }

    endpoints.data.forEach((endpoint, index) => {
      console.log(`📌 Webhook ${index + 1}:`);
      console.log(`   ID: ${endpoint.id}`);
      console.log(`   URL: ${endpoint.url}`);
      console.log(`   Status: ${endpoint.status}`);
      console.log(`   Created: ${new Date(endpoint.created * 1000).toLocaleString()}`);
      console.log(`   Description: ${endpoint.description || 'No description'}`);
      console.log(`   Events (${endpoint.enabled_events.length}):`);
      
      endpoint.enabled_events.forEach(event => {
        const isImportant = event === 'issuing_authorization.request';
        console.log(`     ${isImportant ? '⚠️' : '•'} ${event}`);
      });
      
      // Safely display partial secret
      if (endpoint.secret && endpoint.secret.length > 15) {
        console.log(`   Secret: whsec_${endpoint.secret.substring(7, 15)}...`);
      } else {
        console.log(`   Secret: [configured]`);
      }
      console.log('');
    });

    // Check if production URL is configured
    const prodEndpoint = endpoints.data.find(e => 
      e.url.includes('pluxee-two.vercel.app')
    );

    if (prodEndpoint) {
      console.log('✅ Production webhook endpoint found!');
      console.log(`   Using: ${prodEndpoint.url}`);
      
      // Check for critical authorization event
      if (prodEndpoint.enabled_events.includes('issuing_authorization.request')) {
        console.log('✅ Real-time authorization events configured');
      } else {
        console.log('⚠️  Missing critical authorization.request event');
      }
    } else {
      console.log('❌ No production webhook endpoint found');
      console.log('💡 Run: node scripts/setup-webhook.js to create one');
    }

  } catch (error) {
    console.error('❌ Failed to list webhook endpoints:', error.message);
  }
}

async function testWebhook(webhookId) {
  try {
    console.log(`🧪 Testing webhook endpoint: ${webhookId}`);
    
    // This would send a test event to the webhook
    const testEvent = await stripe.webhookEndpoints.retrieve(webhookId);
    console.log('📡 Webhook details retrieved successfully');
    console.log(`   URL: ${testEvent.url}`);
    console.log(`   Status: ${testEvent.status}`);
    
  } catch (error) {
    console.error('❌ Failed to test webhook:', error.message);
  }
}

// Check if Stripe key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/list-webhooks.js');
  process.exit(1);
}

const command = process.argv[2];
const webhookId = process.argv[3];

if (command === 'test' && webhookId) {
  testWebhook(webhookId);
} else {
  listWebhooks();
} 