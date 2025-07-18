'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEMO_CONFIG } from '@/demo-config';

interface PaymentResult {
  session_id: string;
  merchant: string;
  mcc: string;
  amount: number;
  currency: string;
  status: string;
  payment_intent?: string;
}

export default function CheckoutSuccessPage() {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const merchant = searchParams.get('merchant');
    const mcc = searchParams.get('mcc');
    const cardId = searchParams.get('card_id');

    if (sessionId && merchant && mcc) {
      fetchPaymentResult(sessionId, merchant, mcc, cardId);
    } else {
      setError('Paramètres de session manquants');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentResult = async (sessionId: string, merchant: string, mcc: string, cardId: string | null) => {
    try {
      const accountId = localStorage.getItem('demo-account-id');
      const response = await fetch(`/api/checkout/session-result?session_id=${sessionId}&account_id=${accountId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment result');
      }
      
      const result = await response.json();
      
      setPaymentResult({
        session_id: sessionId,
        merchant: decodeURIComponent(merchant),
        mcc,
        amount: result.amount_total || 0,
        currency: result.currency || 'gbp',
        status: result.payment_status || 'unknown',
        payment_intent: result.payment_intent,
      });

      // Store transaction in localStorage for demo
      const transactions = JSON.parse(localStorage.getItem('demo-transactions') || '[]');
      transactions.push({
        id: result.payment_intent || sessionId,
        timestamp: new Date().toISOString(),
        merchant: decodeURIComponent(merchant),
        mcc,
        amount: result.amount_total || 0,
        currency: result.currency || 'gbp',
        status: result.payment_status === 'paid' ? 'approved' : 'declined',
        type: 'real_payment',
        session_id: sessionId,
      });
      localStorage.setItem('demo-transactions', JSON.stringify(transactions));

    } catch (err) {
      console.error('Failed to fetch payment result:', err);
              setError('Error retrieving payment result');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment verification...</h2>
          <p className="text-gray-600">Retrieving transaction details</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
                          Back to shopping
          </button>
        </div>
      </div>
    );
  }

  if (!paymentResult) {
    return null;
  }

  const mccInfo = getMCCInfo(paymentResult.mcc);
  const isSuccess = paymentResult.status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Payment result</h1>
            <button
              onClick={() => router.push('/checkout')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              ← Back to shopping
            </button>
          </div>
        </div>

        {/* Payment Result */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className={`p-6 rounded-lg border-2 ${
            isSuccess 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`text-4xl ${
                isSuccess ? 'text-green-600' : 'text-red-600'
              }`}>
                {isSuccess ? '✅' : '❌'}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isSuccess ? 'text-green-900' : 'text-red-900'
                }`}>
                  {isSuccess ? 'Payment successful!' : 'Payment failed'}
                </h2>
                <p className={`text-sm ${
                  isSuccess ? 'text-green-700' : 'text-red-700'
                }`}>
                  {isSuccess 
                    ? 'Votre transaction a été traitée avec succès' 
                    : 'An error occurred during processing'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Montant</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(paymentResult.amount, paymentResult.currency)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Marchand</p>
                <p className="text-lg font-semibold text-gray-900">{paymentResult.merchant}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">MCC Category</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentResult.mcc} - {mccInfo.name} {mccInfo.icon}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <p className={`text-lg font-semibold ${
                  isSuccess ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isSuccess ? 'Payé' : 'Échoué'}
                </p>
              </div>
            </div>

            {paymentResult.payment_intent && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                <p className="text-sm text-gray-600 mb-1">ID de transaction</p>
                <p className="font-mono text-xs text-gray-800">{paymentResult.payment_intent}</p>
              </div>
            )}

            {isSuccess && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>✨ Real payment processed!</strong> This transaction will appear in your Stripe dashboard. 
                  You can now test how MCC controls would work with issuing cards.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Étapes suivantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/checkout')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🛒</div>
              <h4 className="font-semibold text-blue-900">Test other payments</h4>
                              <p className="text-sm text-blue-700 mt-1">Try other merchants and MCC categories</p>
            </button>
            
            <button
              onClick={() => window.open('https://dashboard.stripe.com/payments', '_blank')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-green-900">Voir dans Stripe</h4>
              <p className="text-sm text-green-700 mt-1">Consulter cette transaction dans votre tableau de bord</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 