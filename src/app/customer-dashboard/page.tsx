'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEMO_CONFIG } from '@/demo-config';
import { getConnectedAccount, formatCurrency } from '@/lib/storage';

interface AccountStatus {
  id: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  payouts_enabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  business_profile?: {
    name?: string;
    mcc?: string;
  };
}

interface Balance {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
  issuing?: {
    available: Array<{ amount: number; currency: string }>;
  };
}

export default function CustomerDashboard() {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupComplete = searchParams.get('setup') === 'complete';

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
      fetchAccountStatus(accountId);
      fetchBalance(accountId);
    } else {
              setError('No connected account found. Please complete integration first.');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchAccountStatus = async (accountId: string) => {
    try {
      const response = await fetch(`/api/connect/onboarding?account_id=${accountId}`);
      const result = await response.json();
      
      if (result.success) {
        setAccountStatus(result.data);
      } else {
        setError('Error retrieving account status');
      }
    } catch (err) {
      console.error('Failed to fetch account status:', err);
              setError('Connection error');
    }
  };

  const fetchBalance = async (accountId: string) => {
    try {
      const response = await fetch('/api/connect/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const result = await response.json();
      
      if (result.success) {
        setBalance(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFundAccount = async () => {
    const accountId = localStorage.getItem('demo-account-id');
    if (!accountId) return;

    setFundingLoading(true);
    try {
      // Call the funding API endpoint
      const response = await fetch('/api/connect/funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accountId,
                      amount: 100000, // £1000 in cents
          currency: 'gbp'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        alert(`Funding successful: ${result.data.message}`);
        // Refresh balance to show updated amounts
        await fetchBalance(accountId);
      } else {
        setError(result.error || 'Error funding account');
      }
    } catch (err) {
      console.error('Failed to fund account:', err);
              setError('Error funding account');
    } finally {
      setFundingLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    const accountId = localStorage.getItem('demo-account-id');
    if (!accountId) return;

    try {
      const response = await fetch('/api/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accountId,
          refresh_url: window.location.href,
          return_url: `${window.location.origin}/customer-dashboard?account_id=${accountId}&setup=complete`
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect to Stripe's onboarding flow
        window.location.href = result.data.url;
      } else {
        setError(result.error || 'Error generating account link');
      }
    } catch (err) {
      console.error('Failed to generate account link:', err);
      setError('Error generating account link');
    }
  };

  const getCompanyData = () => {
    return DEMO_CONFIG.companies.find(c => c.name === companyName) || DEMO_CONFIG.companies[0];
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600' : 'text-yellow-600';
  };

  const getStatusText = (enabled: boolean) => {
    return enabled ? 'Active' : 'Pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Restart integration
          </button>
        </div>
      </div>
    );
  }

  const company = getCompanyData();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {setupComplete && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">
                <strong>Integration completed successfully!</strong> Your {company.name} account is now connected.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600 mt-1">Company dashboard</p>
            </div>
            <div className="text-right">
                              <p className="text-sm text-gray-500">Connected account</p>
              <p className="font-mono text-sm text-gray-700">{accountStatus?.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payments</span>
                <span className={`font-semibold ${getStatusColor(accountStatus?.charges_enabled || false)}`}>
                  {getStatusText(accountStatus?.charges_enabled || false)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Details submitted</span>
                <span className={`font-semibold ${getStatusColor(accountStatus?.details_submitted || false)}`}>
                  {getStatusText(accountStatus?.details_submitted || false)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payouts</span>
                <span className={`font-semibold ${getStatusColor(accountStatus?.payouts_enabled || false)}`}>
                  {getStatusText(accountStatus?.payouts_enabled || false)}
                </span>
              </div>
            </div>

            {accountStatus?.requirements && accountStatus.requirements.currently_due.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-yellow-800 text-sm font-medium">
                      <strong>⚠️ Account Setup Incomplete</strong>
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      {accountStatus.requirements.currently_due.length} verification step(s) required to activate all features
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteOnboarding}
                    className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Complete Setup</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Balance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Balances</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Issuing balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance?.issuing?.available?.[0] ? formatCurrency(balance.issuing.available[0].amount, balance.issuing.available[0].currency) : '£0.00'}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Available</p>
                <p className="text-lg text-gray-700">
                  {balance?.available?.[0] ? formatCurrency(balance.available[0].amount, balance.available[0].currency) : '£0.00'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-lg text-gray-700">
                  {balance?.pending?.[0] ? formatCurrency(balance.pending[0].amount, balance.pending[0].currency) : '£0.00'}
                </p>
              </div>
            </div>

            <button
              onClick={handleFundAccount}
              disabled={fundingLoading}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fundingLoading ? 'Funding...' : 'Fund issuing balance (£1000)'}
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Company information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {company.name}</p>
                <p><strong>Email:</strong> {company.email}</p>
                                  <p><strong>Country:</strong> {company.country}</p>
                                  <p><strong>Type:</strong> {company.business_type === 'company' ? 'Company' : 'Individual'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Employees ({company.employees.length})</h3>
              <div className="space-y-2 text-sm">
                {company.employees.slice(0, 3).map((employee, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{employee.name}</span>
                    <span className="text-gray-600">{employee.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                router.push(`/manage-cards${accountId ? `?account_id=${accountId}` : ''}`);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900">Manage cards</h3>
                              <p className="text-sm text-gray-600 mt-1">Create cardholders and issue virtual cards</p>
            </button>
            
            <button
              onClick={() => {
                const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                router.push(`/webhooks${accountId ? `?account_id=${accountId}` : ''}`);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📡</div>
              <h3 className="font-semibold text-gray-900">Webhooks</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor real-time events</p>
            </button>
            
            <button
              onClick={() => {
                const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
                router.push(`/checkout${accountId ? `?account_id=${accountId}` : ''}`);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🛒</div>
                              <h3 className="font-semibold text-gray-900">Test payments</h3>
                              <p className="text-sm text-gray-600 mt-1">Simulate purchases with MCC controls</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 