'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DEMO_CONFIG } from '@/demo-config';
import { Card } from '@/lib/cards';

export default function CheckoutPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get account ID from URL parameter first, then fallback to localStorage
    const urlAccountId = searchParams.get('account_id');
    const storageAccountId = localStorage.getItem('demo-account-id');
    const accountId = urlAccountId || storageAccountId;
    
    const savedCompanyName = localStorage.getItem('demo-company-name') || 'Test London Ltd';
    setCompanyName(savedCompanyName);

    if (accountId) {
      // Update localStorage if we got the ID from URL
      if (urlAccountId && urlAccountId !== storageAccountId) {
        localStorage.setItem('demo-account-id', urlAccountId);
      }
      loadCards(accountId);
    } else {
              setError('No account found. Please complete integration first.');
      setLoading(false);
    }
  }, [searchParams]);

  const loadCards = async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch cards from API
      const response = await fetch(`/api/issuing/cards?accountId=${accountId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setCards(result.data);
        if (result.data.length > 0) {
          setSelectedCard(result.data[0].id);
        }
      } else {
        // If no cards from API, fallback to localStorage for backward compatibility
        const savedCards = localStorage.getItem('demo-cards');
        if (savedCards) {
          const cardsData = JSON.parse(savedCards);
          setCards(cardsData);
          if (cardsData.length > 0) {
            setSelectedCard(cardsData[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load cards:', err);
              setError('Error loading cards');
      
      // Fallback to localStorage if API fails
      const savedCards = localStorage.getItem('demo-cards');
      if (savedCards) {
        const cardsData = JSON.parse(savedCards);
        setCards(cardsData);
        if (cardsData.length > 0) {
          setSelectedCard(cardsData[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'gbp') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getMCCInfo = (mcc: string) => {
    return DEMO_CONFIG.mccCodes[mcc] || { name: 'Unknown', allowed: false, icon: '❓' };
  };

  const getSlugForMerchant = (merchantName: string) => {
    const slugMap: { [key: string]: string } = {
      'Paul': 'paul',
      'Uber': 'uber', 
      'Sephora': 'sephora',
      'Gas Station': 'gas-station',
      'Casino': 'casino'
    };
    return slugMap[merchantName] || merchantName.toLowerCase().replace(/\s+/g, '-');
  };

  const allMerchants = [
    ...DEMO_CONFIG.merchants.allowed,
    ...DEMO_CONFIG.merchants.blocked,
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading cards...</h2>
          <p className="text-gray-600">Retrieving your available cards</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                if (accountId) {
                  loadCards(accountId);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/manage-cards')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Manage cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No card available</h2>
                      <p className="text-gray-600 mb-4">Create a card first to test payments.</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => router.push('/manage-cards')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create card
            </button>
            <button
              onClick={() => {
                const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                if (accountId) {
                  loadCards(accountId);
                }
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issuing Transactions Simulation</h1>
              <p className="text-gray-600 mt-1">Simulate purchases with MCC controls - {companyName}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                  if (accountId) {
                    loadCards(accountId);
                  }
                }}
                disabled={loading}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => {
                  const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                  router.push(`/customer-dashboard${accountId ? `?account_id=${accountId}` : ''}`);
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Card Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available cards</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{cards.length} card{cards.length > 1 ? 's' : ''} available</span>
              <button
                onClick={() => router.push('/manage-cards')}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
              >
                + Create card
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCard === card.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCard(card.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">💳</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">**** {card.last4}</p>
                    <p className="text-sm text-gray-600">
                      {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedCard && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Active spending limits</h3>
              {cards.find(c => c.id === selectedCard)?.spending_limits.map((limit, index) => (
                <p key={index} className="text-sm text-blue-800">
                  • {formatCurrency(limit.amount)} per {limit.interval === 'monthly' ? 'month' : 'day'}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Merchant Scenarios */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            MCC test scenarios ({allMerchants.length} merchants)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Allowed Merchants */}
            {DEMO_CONFIG.merchants.allowed.map((merchant) => {
              const mccInfo = getMCCInfo(merchant.mcc);
              const merchantSlug = getSlugForMerchant(merchant.name);
              
              return (
                <Link
                  key={merchant.name}
                  href={`/checkout/${merchantSlug}`}
                  className="block bg-white rounded-xl shadow-sm border-2 border-green-200 p-6 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="text-4xl">{merchant.logo}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{merchant.name}</h3>
                      <p className="text-sm text-gray-600">{merchant.description}</p>
                    </div>
                    <div className="text-green-600 text-xl">✅</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      MCC: {merchant.mcc} - {mccInfo.name}
                    </div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Authorized
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    Products: {merchant.products.slice(0, 2).map(p => p.name).join(', ')}
                    {merchant.products.length > 2 && '...'}
                  </div>
                </Link>
              );
            })}

            {/* Blocked Merchants */}
            {DEMO_CONFIG.merchants.blocked.map((merchant) => {
              const mccInfo = getMCCInfo(merchant.mcc);
              const merchantSlug = getSlugForMerchant(merchant.name);
              
              return (
                <Link
                  key={merchant.name}
                  href={`/checkout/${merchantSlug}`}
                  className="block bg-white rounded-xl shadow-sm border-2 border-red-200 p-6 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="text-4xl">{merchant.logo}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{merchant.name}</h3>
                      <p className="text-sm text-gray-600">{merchant.description}</p>
                    </div>
                    <div className="text-red-600 text-xl">❌</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      MCC: {merchant.mcc} - {mccInfo.name}
                    </div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Blocked
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    Products: {merchant.products.slice(0, 2).map(p => p.name).join(', ')}
                    {merchant.products.length > 2 && '...'}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Test Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                // Test all allowed merchants
                window.open('/checkout/paul', '_blank');
                setTimeout(() => window.open('/checkout/uber', '_blank'), 500);
                setTimeout(() => window.open('/checkout/sephora', '_blank'), 1000);
              }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-900">Test all authorized</h3>
              <p className="text-sm text-green-700 mt-1">Opens the 3 authorized merchants</p>
            </button>
            
            <button
              onClick={() => {
                // Test blocked merchants
                window.open('/checkout/gas-station', '_blank');
                setTimeout(() => window.open('/checkout/casino', '_blank'), 500);
              }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">❌</div>
              <h3 className="font-semibold text-red-900">Test blocked merchants</h3>
              <p className="text-sm text-red-700 mt-1">Opens blocked merchants (gas & gambling)</p>
            </button>
            
            <button
              onClick={() => router.push('/webhooks')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📡</div>
              <h3 className="font-semibold text-blue-900">Monitor events</h3>
                              <p className="text-sm text-blue-700 mt-1">View real-time webhooks</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 