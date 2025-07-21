'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_CONFIG } from '@/demo-config';
import { getFirstAvailableCard, Card } from '@/lib/cards';
import { useSearchParams } from 'next/navigation';

interface AuthorizationResult {
  success: boolean;
  authorized: boolean;
  amount: number;
  currency: string;
  merchant: string;
  mcc: string;
  reason?: string;
  authorizationId?: string;
  message: string;
}

export default function GasStationCheckoutPage() {
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [authResult, setAuthResult] = useState<AuthorizationResult | null>(null);
  const [cardInfo, setCardInfo] = useState<Card | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const merchant = DEMO_CONFIG.merchants.blocked.find(m => m.name === 'Gas Station')!
  const mccInfo = DEMO_CONFIG.mccCodes[merchant.mcc];

  useEffect(() => {
    const cardId = searchParams.get('card_id');
    loadCard(cardId);
  }, [searchParams]);

  const loadCard = async (cardId: string | null) => {
    setCardLoading(true);
    try {
      if (cardId) {
        const accountId = localStorage.getItem('demo-account-id');
        if (accountId) {
          const response = await fetch(`/api/issuing/cards/${cardId}?accountId=${accountId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setCardInfo(result.data);
            }
          }
        }
      } else {
        const card = await getFirstAvailableCard();
        setCardInfo(card);
      }
    } catch (error) {
      console.error('Failed to load card:', error);
    } finally {
      setCardLoading(false);
    }
  };

  const getTotalAmount = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = merchant.products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const updateQuantity = (productId: string, change: number) => {
    setSelectedProducts(prev => {
      const newQuantity = (prev[productId] || 0) + change;
      if (newQuantity <= 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
              currency: 'GBP',
    }).format(amount / 100);
  };

  const handlePayment = async () => {
    if (!cardInfo) {
              alert('No card available');
      return;
    }

    const totalAmount = getTotalAmount();
    if (totalAmount === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }

    setLoading(true);
    setAuthResult(null);

    try {
      const accountId = localStorage.getItem('demo-account-id');
      
      const response = await fetch('/api/checkout/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          cardId: cardInfo.id,
          amount: totalAmount,
          currency: 'gbp',
          merchant: {
            name: merchant.name,
            mcc: merchant.mcc,
            category: merchant.category,
          },
          products: Object.entries(selectedProducts).map(([productId, quantity]) => {
            const product = merchant.products.find(p => p.id === productId)!;
            return {
              ...product,
              quantity,
              total: product.price * quantity,
            };
          }),
        }),
      });

      const result = await response.json();
      setAuthResult(result);

    } catch (error) {
      console.error('Payment failed:', error);
      setAuthResult({
        success: false,
        authorized: false,
        amount: totalAmount,
        currency: 'gbp',
        merchant: merchant.name,
        mcc: merchant.mcc,
        message: 'Connection error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{merchant.logo}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{merchant.name}</h1>
                <p className="text-gray-600">{merchant.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ❌ MCC Blocked
                  </div>
                  <span className="text-sm text-gray-500">
                    MCC: {merchant.mcc} - {mccInfo.name} {mccInfo.icon}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Category blocked by policy</h3>
              <p className="text-red-700 text-sm">
                Gas stations are blocked by your card's spending controls. 
                This transaction will be automatically declined.
              </p>
            </div>
          </div>
        </div>

        {/* Card Information */}
        {cardLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Loading card...</h2>
            <div className="flex items-center space-x-3">
              <div className="animate-pulse w-12 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="animate-pulse h-4 bg-gray-200 rounded mb-2"></div>
                <div className="animate-pulse h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ) : cardInfo ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Card used</h2>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">💳</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">**** **** **** {cardInfo.last4}</p>
                <p className="text-sm text-gray-600">
                  Expire: {cardInfo.exp_month.toString().padStart(2, '0')}/{cardInfo.exp_year}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">No card available</h2>
            <div className="flex items-center justify-between">
                              <p className="text-gray-600">Create a card first to make payments.</p>
              <button
                onClick={() => router.push('/manage-cards')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Créer une carte
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available products</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {merchant.products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                      <p className="font-bold text-red-600">{formatCurrency(product.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={!selectedProducts[product.id]}
                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {selectedProducts[product.id] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      {selectedProducts[product.id] && (
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price * selectedProducts[product.id])}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order</h2>
              
              {Object.keys(selectedProducts).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No product selected
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {Object.entries(selectedProducts).map(([productId, quantity]) => {
                      const product = merchant.products.find(p => p.id === productId)!;
                      return (
                        <div key={productId} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">x{quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(product.price * quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-gray-900">Total</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(getTotalAmount())}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> ⚠️ This transaction will be declined
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading || !cardInfo}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </div>
                    ) : (
                      'Attempt payment (will be declined)'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Authorization Result */}
        {authResult && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Résultat de l'autorisation</h2>
            
            <div className={`p-4 rounded-lg border-2 ${
              authResult.authorized 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`text-2xl ${
                  authResult.authorized ? 'text-green-600' : 'text-red-600'
                }`}>
                  {authResult.authorized ? '✅' : '❌'}
                </div>
                <div>
                  <p className={`font-bold text-lg ${
                    authResult.authorized ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {authResult.authorized ? 'Payment authorized' : 'Payment declined'}
                  </p>
                  <p className={`text-sm ${
                    authResult.authorized ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {authResult.message}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Amount:</p>
                  <p className="font-medium">{formatCurrency(authResult.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Merchant:</p>
                  <p className="font-medium">{authResult.merchant}</p>
                </div>
                <div>
                  <p className="text-gray-600">MCC Category:</p>
                  <p className="font-medium">{authResult.mcc} - {mccInfo.name}</p>
                </div>
                {authResult.authorizationId && (
                  <div>
                    <p className="text-gray-600">ID Autorisation:</p>
                    <p className="font-mono text-xs">{authResult.authorizationId}</p>
                  </div>
                )}
              </div>
              
              {authResult.reason && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                  <p className="text-sm text-red-900">
                    <strong>Raison du refus:</strong> {authResult.reason}
                  </p>
                </div>
              )}
              
              {!authResult.authorized && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Explanation:</strong> This merchant category (gas stations) is blocked by the spending controls configured on your card. This is an example of how Stripe Issuing protects against unauthorized purchases.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 