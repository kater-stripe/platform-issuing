'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectComponentsProvider,
  ConnectIssuingCardsList,
  ConnectIssuingCard,
} from '@stripe/react-connect-js';
import { DEMO_CONFIG } from '@/demo-config';

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

interface ManualCardholderData {
  name: string;
  email: string;
  phone: string;
}

export default function ManageCardsPage() {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [accountId, setAccountId] = useState<string>('');
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCardholder, setShowCreateCardholder] = useState(false);
  const [cardholderData, setCardholderData] = useState<ManualCardholderData>({
    name: '',
    email: '',
    phone: ''
  });
  const [creatingCardholder, setCreatingCardholder] = useState(false);
  const [cardholders, setCardholders] = useState<any[]>([]);
  const [creatingCard, setCreatingCard] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showIndividualCard, setShowIndividualCard] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    initializeStripeConnect();
  }, []);

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

  const initializeStripeConnect = async () => {
    try {
      // Get account ID from URL parameter first, then fallback to localStorage
      const urlAccountId = searchParams.get('account_id');
      const storageAccountId = localStorage.getItem('demo-account-id');
      const currentAccountId = urlAccountId || storageAccountId;
      
      setAccountId(currentAccountId || '');

      if (!currentAccountId) {
        setError('No connected account found. Please complete integration first.');
        setLoading(false);
        return;
      }

      // Fetch account status to get company name
      await fetchAccountStatus(currentAccountId);

      // Update localStorage if we got the ID from URL
      if (urlAccountId && urlAccountId !== storageAccountId) {
        localStorage.setItem('demo-account-id', urlAccountId);
      }

      // Fetch existing cardholders
      await fetchCardholders(currentAccountId);

      // Initialize Stripe Connect with embedded components
      const stripeConnectInstance = await loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        fetchClientSecret: async () => {
          const response = await fetch('/api/connect/account-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accountId: currentAccountId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create account session');
          }

          const { client_secret } = await response.json();
          return client_secret;
        },
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#000000',
            borderRadius: '8px',
          },
        },
      });

      setStripeConnectInstance(stripeConnectInstance as any);
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize Stripe Connect:', err);
              setError('Error initializing Stripe Connect');
      setLoading(false);
    }
  };

  const fetchCardholders = async (accountId: string) => {
    try {
      const response = await fetch(`/api/issuing/cardholders?accountId=${accountId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCardholders(result.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cardholders:', err);
    }
  };

  const handleCreateCardholder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardholderData.name || !cardholderData.email || !cardholderData.phone) {
      setError('All fields are required');
      return;
    }

    setCreatingCardholder(true);
    setError(null);

    try {
      const company = DEMO_CONFIG.companies[0]; // Use first company as default
      
      const response = await fetch('/api/issuing/cardholders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          employeeData: cardholderData,
          companyData: company,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form and close modal
        setCardholderData({ name: '', email: '', phone: '' });
        setShowCreateCardholder(false);
        
        // Refresh cardholders list
        await fetchCardholders(accountId);
        
        // Refresh the embedded components by re-initializing
        await initializeStripeConnect();
      } else {
        setError(result.message || 'Error creating cardholder');
      }
    } catch (err) {
      console.error('Cardholder creation failed:', err);
      setError('Connection error. Please try again.');
    } finally {
      setCreatingCardholder(false);
    }
  };

  const handleQuickCreateCardholder = async (employeeData: any) => {
    setCreatingCardholder(true);
    setError(null);

    try {
      const company = DEMO_CONFIG.companies[0]; // Use first company as default
      
      const response = await fetch('/api/issuing/cardholders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          employeeData,
          companyData: company,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh cardholders list
        await fetchCardholders(accountId);
        
        // Refresh the embedded components
        await initializeStripeConnect();
      } else {
        setError(result.message || 'Error creating cardholder');
      }
    } catch (err) {
      console.error('Cardholder creation failed:', err);
      setError('Connection error. Please try again.');
    } finally {
      setCreatingCardholder(false);
    }
  };

  const handleCreateCard = async (cardholderId: string) => {
    setCreatingCard(cardholderId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/issuing/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          cardholderId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Card created successfully!');
        // Refresh the embedded components to show the new card
        await initializeStripeConnect();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
                  setError(result.message || 'Error creating card');
      }
            } catch (err) {
        console.error('Card creation failed:', err);
        setError('Connection error. Please try again.');
    } finally {
      setCreatingCard(null);
    }
  };

  const getCompanyData = () => {
    return DEMO_CONFIG.companies[0]; // Use first company as default
  };

  // Ephemeral key callback for PAN/PIN viewing
  const fetchEphemeralKey = async (fetchParams: { issuingCard: string; nonce: string }) => {
    const { issuingCard, nonce } = fetchParams;

    try {
      const response = await fetch('/api/issuing/ephemeral-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: issuingCard,
          nonce: nonce,
          accountId: accountId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ephemeral key');
      }

      const data = await response.json();
      return {
        issuingCard: data.issuingCard,
        nonce: data.nonce,
        ephemeralKeySecret: data.ephemeralKeySecret,
      };
    } catch (error) {
      console.error('Error fetching ephemeral key:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading Stripe Connect components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to integration
            </button>
          </div>
        </div>
      </div>
    );
  }

  const companyData = getCompanyData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                🏢 {accountStatus?.business_profile?.name || 'Company Dashboard'}
              </div>
              <div className="ml-4 text-sm text-gray-500">
                Business Card Management
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/webhooks')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                                  Events
              </button>
              <button
                onClick={() => router.push('/checkout')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Go to checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {stripeConnectInstance ? (
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {/* View Toggle */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Display Mode</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowIndividualCard(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !showIndividualCard
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Card list
                  </button>
                  <button
                    onClick={() => setShowIndividualCard(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showIndividualCard
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Individual card
                  </button>
                </div>
              </div>
            </div>

            {/* Cardholders Section */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Cardholders</h2>
                <button
                  onClick={() => setShowCreateCardholder(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={creatingCardholder}
                >
                  {creatingCardholder ? 'Creating...' : 'Create Cardholder'}
                </button>
              </div>

              {/* Quick Create Buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Quick creation for demo:</p>
                <div className="flex flex-wrap gap-2">
                  {getCompanyData().employees?.map((employee) => (
                    <button
                      key={employee.name}
                      onClick={() => handleQuickCreateCardholder(employee)}
                      disabled={creatingCardholder}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      + {employee.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Existing Cardholders */}
              {cardholders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardholders.map((cardholder) => (
                    <div
                      key={cardholder.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{cardholder.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          cardholder.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cardholder.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{cardholder.email}</p>
                      <button
                        onClick={() => handleCreateCard(cardholder.id)}
                        disabled={creatingCard === cardholder.id}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {creatingCard === cardholder.id ? 'Creating...' : 'Create Card'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cards Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {showIndividualCard ? 'Individual Card Management' : 'Card List'}
              </h2>
              <div className="min-h-[500px]">
                {showIndividualCard ? (
                  <ConnectIssuingCard
                    cardSwitching={true}
                    showSpendControls={true}
                    fetchEphemeralKey={fetchEphemeralKey}
                  />
                ) : (
                  <ConnectIssuingCardsList />
                )}
              </div>
            </div>
          </ConnectComponentsProvider>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing Stripe Connect components...</p>
          </div>
        )}
      </div>

      {/* Manual Cardholder Creation Modal */}
      {showCreateCardholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Custom Cardholder
            </h3>
            
            <form onSubmit={handleCreateCardholder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={cardholderData.name}
                  onChange={(e) => setCardholderData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: John Smith"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={cardholderData.email}
                  onChange={(e) => setCardholderData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: john.smith@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={cardholderData.phone}
                  onChange={(e) => setCardholderData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: +44 20 1234 5678"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCardholder(false);
                    setError(null);
                    setCardholderData({ name: '', email: '', phone: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={creatingCardholder}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={creatingCardholder}
                >
                  {creatingCardholder ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 