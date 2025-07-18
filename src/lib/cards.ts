// Utility functions for card management

export interface Card {
  id: string;
  cardholder: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  spending_limits: Array<{
    amount: number;
    interval: string;
  }>;
  allowed_categories: string[];
  blocked_categories: string[];
  status: string;
}

/**
 * Load cards from API with fallback to localStorage
 */
export async function loadCards(accountId?: string | null): Promise<Card[]> {
  const currentAccountId = accountId || 
    (typeof window !== 'undefined' ? localStorage.getItem('demo-account-id') : null);
  
  if (!currentAccountId) {
    console.warn('No account ID available for loading cards');
    return [];
  }

  try {
    // Fetch cards from API
    const response = await fetch(`/api/issuing/cards?accountId=${currentAccountId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cards from API');
    }
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      return result.data;
    }
    
    // Fallback to localStorage if no cards from API
    if (typeof window !== 'undefined') {
      const savedCards = localStorage.getItem('demo-cards');
      if (savedCards) {
        return JSON.parse(savedCards);
      }
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load cards:', error);
    
    // Fallback to localStorage on error
    if (typeof window !== 'undefined') {
      const savedCards = localStorage.getItem('demo-cards');
      if (savedCards) {
        return JSON.parse(savedCards);
      }
    }
    
    return [];
  }
}

/**
 * Get the first available card for checkout
 */
export async function getFirstAvailableCard(accountId?: string | null): Promise<Card | null> {
  const cards = await loadCards(accountId);
  return cards.length > 0 ? cards[0] : null;
} 