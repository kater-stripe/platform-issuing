// Demo utilities for accessing configuration and helper functions
// Following @demo-utilities patterns

import { DEMO_CONFIG } from '@/demo-config';

// Re-export demo configuration for easy access
export { DEMO_CONFIG };

// Get demo data helpers
export function getDemoData() {
  return DEMO_CONFIG;
}

export function getDefaultCardholder() {
  return DEMO_CONFIG.defaults.cardholder;
}

export function getDefaultCard() {
  return DEMO_CONFIG.defaults.card;
}

export function getDefaultFunding() {
  return DEMO_CONFIG.defaults.funding;
}

// Company and employee helpers
export function getCompanyInfo() {
  return DEMO_CONFIG.companies[0]; // Test London Ltd (primary demo company)
}

export function getEmployeeInfo(index = 0) {
  const company = getCompanyInfo();
  return company.employees[index] || company.employees[0]; // Olivia Dubois by default
}

export function getOliviaDubois() {
  return getEmployeeInfo(0); // First employee is Olivia
}

export function getRandomEmployee() {
  const companies = DEMO_CONFIG.companies;
  const randomCompany = companies[Math.floor(Math.random() * companies.length)];
  const employees = randomCompany.employees;
  return employees[Math.floor(Math.random() * employees.length)];
}

export function getRandomCompany() {
  const companies = DEMO_CONFIG.companies;
  return companies[Math.floor(Math.random() * companies.length)];
}

// Merchant helpers
export function getMerchantByName(name: string) {
  const allMerchants = [...DEMO_CONFIG.merchants.allowed, ...DEMO_CONFIG.merchants.blocked];
  return allMerchants.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
}

export function getAllowedMerchants() {
  return DEMO_CONFIG.merchants.allowed;
}

export function getBlockedMerchants() {
  return DEMO_CONFIG.merchants.blocked;
}

export function isAllowedMCC(mcc: string): boolean {
  return DEMO_CONFIG.merchants.allowed.some(m => m.mcc === mcc);
}

export function getMerchantByMCC(mcc: string) {
  const allMerchants = [...DEMO_CONFIG.merchants.allowed, ...DEMO_CONFIG.merchants.blocked];
  return allMerchants.find(m => m.mcc === mcc);
}

// MCC utilities
export function getMCCInfo(mcc: string) {
  return DEMO_CONFIG.mccCodes[mcc] || { 
    name: `MCC ${mcc}`, 
    allowed: false, 
    icon: '❓' 
  };
}

export function getAllMCCCodes() {
  return DEMO_CONFIG.mccCodes;
}

// Spending limits helpers
export function getSpendingLimitPresets() {
  return DEMO_CONFIG.spendingLimits;
}

export function getStandardEmployeeLimit() {
  return DEMO_CONFIG.spendingLimits.find(limit => limit.name === 'Standard Employee');
}

export function getManagerLimit() {
  return DEMO_CONFIG.spendingLimits.find(limit => limit.name === 'Manager');
}

export function getExecutiveLimit() {
  return DEMO_CONFIG.spendingLimits.find(limit => limit.name === 'Executive');
}

// Demo phase helpers
export function getDemoPhases() {
  return DEMO_CONFIG.demoPhases;
}

export function getDemoPhase(id: string) {
  return DEMO_CONFIG.demoPhases.find(phase => phase.id === id);
}

export function getNextDemoPhase(currentId: string) {
  const phases = DEMO_CONFIG.demoPhases;
  const currentIndex = phases.findIndex(phase => phase.id === currentId);
  return currentIndex >= 0 && currentIndex < phases.length - 1 
    ? phases[currentIndex + 1] 
    : null;
}

// API endpoint helpers
export function getAPIEndpoints() {
  return DEMO_CONFIG.apiEndpoints;
}

export function getConnectEndpoints() {
  return DEMO_CONFIG.apiEndpoints.connect;
}

export function getIssuingEndpoints() {
  return DEMO_CONFIG.apiEndpoints.issuing;
}

// Webhook event helpers
export function getRelevantWebhookEvents() {
  return DEMO_CONFIG.relevantWebhookEvents;
}

export function isRelevantWebhookEvent(eventType: string) {
  return DEMO_CONFIG.relevantWebhookEvents.includes(eventType);
}

// UI helpers
export function getUIColors() {
  return DEMO_CONFIG.ui.colors;
}

export function getPrimaryColor() {
  return DEMO_CONFIG.ui.colors.primary;
}

// Utility functions for demo
export function generateCardNumber(): string {
  // Generate last 4 digits for display
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateMockTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMockAuthorizationId(): string {
  return `iauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Pre-fill form helpers
export function getOnboardingFormData() {
  const company = getCompanyInfo();
  return {
    business_name: company.name,
    email: company.email,
    country: company.country,
    business_type: company.business_type,
  };
}

export function getCardholderFormData() {
  const employee = getOliviaDubois();
  return {
    name: employee.name,
    email: employee.email,
    phone_number: employee.phone,
    billing_address: {
      line1: '16 Oxford Street',
      city: 'London',
      postal_code: 'W1C 1AA',
      country: 'GB'
    },
  };
}

export function getCardCreationFormData() {
  const defaults = getDefaultCard();
  return {
    type: defaults.type,
    currency: defaults.currency,
    spending_controls: defaults.spending_controls,
  };
}

export function getFundingFormData() {
  const defaults = getDefaultFunding();
  return {
    amount: defaults.amount,
    currency: defaults.currency,
    description: defaults.description,
  };
}

// Loading state helpers
export function withLoading<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  loadingCallback?: (isLoading: boolean) => void
): T {
  return (async (...args) => {
    loadingCallback?.(true);
    try {
      return await fn(...args);
    } finally {
      loadingCallback?.(false);
    }
  }) as T;
}

// Error handling for demo
export function handleDemoError(error: any, context: string): string {
  console.error(`Demo error in ${context}:`, error);
  
  // For demo purposes, show user-friendly messages
  if (error.message?.includes('account')) {
    return 'Please create a connected account first';
  } else if (error.message?.includes('cardholder')) {
    return 'Please create a cardholder first';
  } else if (error.message?.includes('card')) {
    return 'Please create a card first';
  } else if (error.message?.includes('funds') || error.message?.includes('balance')) {
    return 'Insufficient funds. Please fund your account first';
  } else if (error.message?.includes('declined')) {
    return 'Transaction declined due to spending controls';
  }
    
  return error.message || 'Something went wrong. Check the console for details.';
}

// Demo success messages
export function getDemoSuccessMessage(context: string): string {
  const messages: Record<string, string> = {
    onboarding: '🎉 Test London Ltd onboarding completed successfully!',
    funding: '💰 Account funded successfully! Ready to issue cards.',
    cardholder: '👤 Olivia Dubois created as cardholder!',
    card: '💳 Virtual card issued with spending controls!',
    transaction: '✅ Transaction processed successfully!',
    webhook: '📡 Webhook event received and processed!',
  };
  
  return messages[context] || '✅ Action completed successfully!';
}