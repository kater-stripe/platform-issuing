'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEMO_CONFIG } from '@/demo-config';
import { loadConnectAndInitialize } from '@stripe/connect-js';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Huel');
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'create' | 'onboard' | 'complete'>('select');
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Clear any potentially stale account data on component mount
    const clearStaleData = () => {
          const existingAccountId = localStorage.getItem('demo-account-id');
    const existingCompany = localStorage.getItem('demo-company-name');
      
      // For demo purposes, always start fresh to avoid account access issues
      if (existingAccountId || existingCompany) {
        console.log('Clearing potentially stale account data');
        localStorage.removeItem('demo-account-id');
        localStorage.removeItem('demo-company-name');
      }
    };
    
    clearStaleData();

    // Handle return from onboarding
    const setupComplete = searchParams.get('setup');
    if (setupComplete === 'complete') {
      setStep('complete');
    }
  }, [searchParams]);

  // Initialize Stripe Connect when we have an account
  useEffect(() => {
    if (accountId && !stripeConnectInstance && step === 'onboard') {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        initializeStripeConnect();
      }, 100);
      
      // Add a fallback timeout to redirect to dashboard after 5 minutes if no completion event
      const fallbackTimeout = setTimeout(() => {
        console.log('Onboarding timeout reached, redirecting to dashboard');
        router.push(`/customer-dashboard?account_id=${accountId}`);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(fallbackTimeout);
    }
  }, [accountId, step, router]);

  const initializeStripeConnect = async () => {
    try {
      console.log('Initializing Stripe Connect for account:', accountId);
      
      const stripeConnectInstance = loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        fetchClientSecret: async () => {
          console.log('Fetching client secret for account:', accountId);
          
          try {
            const response = await fetch('/api/connect/account-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accountId: accountId
              }),
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Account session response:', result);
            
            if (!result.success) {
              throw new Error(result.error || 'Unknown error occurred');
            }
            
            return result.client_secret;
          } catch (error: any) {
            console.error('Failed to fetch client secret:', error);
            throw new Error(`Failed to get client secret: ${error.message}`);
          }
        },
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#00B894', // Brand green
            fontFamily: 'system-ui, sans-serif',
          }
        },
        locale: 'en-GB'
      });

      console.log('Stripe Connect instance created:', stripeConnectInstance);
      setStripeConnectInstance(stripeConnectInstance);

      // Wait a bit more for DOM to be ready and then mount the component
      setTimeout(() => {
        try {
          console.log('Attempting to mount account onboarding component...');
          
          const mountElement = document.getElementById('stripe-connect-account-onboarding');
          if (!mountElement) {
            console.error('Mount element not found');
            setError('Élément de montage non trouvé');
            return;
          }

          console.log('Mount element found:', mountElement);

          // Create the account onboarding component
          const accountOnboarding = stripeConnectInstance.create('account-onboarding');
          console.log('Account onboarding component created:', accountOnboarding);
          
          // Add load error handler as recommended in the documentation
          if (typeof accountOnboarding.setOnLoadError === 'function') {
            accountOnboarding.setOnLoadError((error: any) => {
              console.error('Component failed to load:', error);
              setError('Error loading onboarding component: ' + error.message);
            });
          }

          // Add loader start handler to know when component is visible
          if (typeof accountOnboarding.setOnLoaderStart === 'function') {
            accountOnboarding.setOnLoaderStart((event: any) => {
              console.log(`${event.elementTagName} is now visible to users`);
              // Hide the loading overlay when component is visible
              const loadingOverlay = document.getElementById('onboarding-loading');
              if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
              }
            });
          }
          
          // Clear any existing content
          mountElement.innerHTML = '';
          
          // Append component to DOM element
          mountElement.appendChild(accountOnboarding);
          console.log('Component appended to mount element');
          
          // Listen for onboarding completion and other events
          if (typeof (accountOnboarding as any).on === 'function') {
            (accountOnboarding as any).on('exit', (event: any) => {
              console.log('Onboarding exit event:', event);
              if (event.reason === 'return_to_dashboard') {
                handleOnboardingComplete();
              }
            });
          }

          // Also listen for other completion events
          if (typeof accountOnboarding.addEventListener === 'function') {
            accountOnboarding.addEventListener('exit', (event: any) => {
              console.log('Onboarding addEventListener exit:', event);
              handleOnboardingComplete();
            });
          }

          console.log('Account onboarding component mounted successfully');
        } catch (mountError: any) {
          console.error('Failed to mount component:', mountError);
          setError('Error mounting component: ' + mountError.message);
        }
      }, 500); // Increased delay to ensure DOM is ready

    } catch (error: any) {
      console.error('Failed to initialize Stripe Connect:', error);
                setError('Error initializing Stripe Connect: ' + error.message);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/connect/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: selectedCompany,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store account ID and company name in localStorage
        localStorage.setItem('demo-account-id', result.data.account.id);
        localStorage.setItem('demo-company-name', selectedCompany);
        
        setAccountId(result.data.account.id);
        setStep('onboard');
      } else {
        setError(result.error || 'Error creating account');
      }
    } catch (err) {
      console.error('Account creation failed:', err);
              setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (companyName: string) => {
    setSelectedCompany(companyName);
    setError(null);
  };

  const handleReset = () => {
    localStorage.removeItem('demo-account-id');
    localStorage.removeItem('demo-company-name');
    setAccountId(null);
    setStep('select');
    setError(null);
    setLoading(false);
    setStripeConnectInstance(null);
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed, redirecting to customer dashboard');
    // Redirect immediately to customer dashboard with account ID
    router.push(`/customer-dashboard?account_id=${accountId}`);
  };

  // Step 1: Company Selection
  if (step === 'select') {
    const selectedCompanyData = DEMO_CONFIG.companies.find(c => c.name === selectedCompany);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Stripe Connect Integration</h1>
            <p className="text-lg text-gray-600">Connect your business to start using our card platform</p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
            {/* Company Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select your company</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_CONFIG.companies.map((company) => (
                  <button
                    key={company.name}
                    onClick={() => handleCompanySelect(company.name)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedCompany === company.name
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{company.email}</p>
                    <p className="text-sm text-gray-500">{company.employees.length} employees</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Company Details */}
            {selectedCompanyData && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                          Pre-filled data for {selectedCompanyData.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedCompanyData.name}</p>
                      <p><strong>Email:</strong> {selectedCompanyData.email}</p>
                                              <p><strong>Country:</strong> {selectedCompanyData.country}</p>
                                              <p><strong>Type:</strong> {selectedCompanyData.business_type === 'company' ? 'Company' : 'Individual'}</p>
                    </div>
                  </div>
                  
                  <div>
                                          <h4 className="font-medium text-gray-900 mb-2">Employees</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {selectedCompanyData.employees.slice(0, 3).map((employee, index) => (
                        <p key={index}>{employee.name} - {employee.role}</p>
                      ))}
                      {selectedCompanyData.employees.length > 3 && (
                        <p className="text-gray-500">
                          +{selectedCompanyData.employees.length - 3} other employees
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                Uses embedded Stripe components for regulatory compliance
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">Integration process with embedded components</h3>
            <div className="space-y-2 text-blue-800">
                              <p>• ✅ Connect Express account with regulatory compliance</p>
                              <p>• ✅ Secure onboarding interface via Stripe</p>
                              <p>• ✅ Automatic terms of service management</p>
                              <p>• ✅ Optimized and localized user experience</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Embedded Onboarding Component
  if (step === 'onboard' && accountId && stripeConnectInstance) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
                          <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedCompany} Integration</h1>
                          <p className="text-lg text-gray-600">Complete the required information for your account</p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Secure onboarding</h2>
              <p className="text-gray-600">
                Embedded Stripe onboarding interface for full regulatory compliance.
              </p>
            </div>

            {/* Embedded Account Onboarding Component */}
            <div className="border rounded-lg p-6 bg-gray-50 min-h-[500px] relative">
              <div id="stripe-connect-account-onboarding" className="min-h-[400px]"></div>
              
              {/* Loading overlay - shown until component loads */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg" id="onboarding-loading">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading secure onboarding component...</p>
                                      <p className="text-gray-500 text-xs mt-2">Integrated Stripe interface</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Reset Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-800 underline mr-4"
              >
                Start over with a new account
              </button>
              <button
                onClick={() => router.push(`/customer-dashboard?account_id=acct_1RgJ4MEQ5uxHOs9V`)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue to dashboard
              </button>
            </div>
          </div>

          {/* Progress Info */}
          <div className="mt-8 bg-green-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-green-900 mb-2">Integration in progress</h3>
            <div className="space-y-2 text-green-800">
                              <p>• ✅ Connect account created for {selectedCompany}</p>
                              <p>• 🔄 Stripe onboarding interface loaded</p>
                              <p>• ⏳ Completing company information</p>
                              <p>• ⏳ Account verification and activation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for onboarding step
  if (step === 'onboard' && accountId && !stripeConnectInstance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading Stripe onboarding interface...</p>
        </div>
      </div>
    );
  }

  // Step 3: Completion
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Integration successful!</h2>
          <p className="text-gray-600 mb-6">
            Your {selectedCompany} account is now configured with regulatory compliance.
          </p>
          <button
            onClick={() => router.push(`/customer-dashboard?account_id=${accountId}`)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
                          Access dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
} 