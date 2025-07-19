'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEMO_CONFIG } from '@/demo-config';

interface WebhookEvent {
  id: string;
  type: string;
  created: number;
  timestamp: string;
  data: any;
  account: string | null;
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [companyName, setCompanyName] = useState<string>('');
  
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
    }
    
    // Load initial events
    loadEvents();
    
    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadEvents();
        setLastRefresh(new Date());
      }, 5000); // Refresh every 5 seconds
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('test-dropdown');
      const button = event.target as Element;
      if (dropdown && !dropdown.contains(button) && !button.closest('button')?.textContent?.includes('Test Event')) {
        dropdown.classList.add('hidden');
      }
    };
    
    document.addEventListener('click', handleClickOutside);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [autoRefresh, searchParams]);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/webhooks/events');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.events);
      } else {
        console.error('Failed to load events:', result.error);
      }
    } catch (error) {
      console.error('Failed to load webhook events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    loadEvents();
    setLastRefresh(new Date());
  };

  const clearEvents = async () => {
    try {
      const response = await fetch('/api/webhooks/events', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to clear events:', error);
    }
  };

  const createTestEvent = async (eventType: string) => {
    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventType }),
      });
      
      if (response.ok) {
        // Refresh events after creating test event
        setTimeout(() => {
          loadEvents();
          setLastRefresh(new Date());
        }, 500);
      }
    } catch (error) {
      console.error('Failed to create test event:', error);
    }
  };

  const getEventIcon = (eventType: string) => {
    const iconMap: { [key: string]: string } = {
      'issuing_authorization.created': '🔒',
      'issuing_authorization.updated': '🔄',
      'issuing_card.created': '💳',
      'issuing_cardholder.created': '👤',
      'account.updated': '🏢',
      'balance.available': '💰',
      'issuing_transaction.created': '💸',
      'default': '📄'
    };
    return iconMap[eventType] || iconMap.default;
  };

  const getEventColor = (eventType: string) => {
    if (DEMO_CONFIG.relevantWebhookEvents.includes(eventType)) {
      return 'border-green-200 bg-green-50';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const getEventTitle = (eventType: string) => {
    const titleMap: { [key: string]: string } = {
      'issuing_authorization.created': 'Authorization created',
      'issuing_authorization.updated': 'Authorization updated',
      'issuing_card.created': 'Card created',
      'issuing_cardholder.created': 'Cardholder created',
      'account.updated': 'Account updated',
      'balance.available': 'Balance updated',
      'issuing_transaction.created': 'Transaction created',
    };
    return titleMap[eventType] || eventType;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(timestamp));
  };

  const formatCurrency = (amount: number, currency: string = 'gbp') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getEventDetails = (event: WebhookEvent) => {
    const { type, data } = event;
    
    switch (type) {
      case 'issuing_authorization.created':
      case 'issuing_authorization.updated':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>Amount:</strong> {formatCurrency(data.amount, data.currency)}</p>
            <p><strong>Status:</strong> {data.status}</p>
            {data.merchant_data?.name && (
              <p><strong>Merchant:</strong> {data.merchant_data.name}</p>
            )}
            {data.merchant_data?.category && (
              <p><strong>MCC:</strong> {data.merchant_data.category}</p>
            )}
          </div>
        );
      
      case 'issuing_card.created':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>Last4:</strong> **** {data.last4}</p>
            <p><strong>Type:</strong> {data.type}</p>
            <p><strong>Status:</strong> {data.status}</p>
          </div>
        );
      
      case 'issuing_cardholder.created':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Status:</strong> {data.status}</p>
          </div>
        );
      
      case 'account.updated':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>Payments:</strong> {data.charges_enabled ? '✅ Enabled' : '❌ Disabled'}</p>
            <p><strong>Details submitted:</strong> {data.details_submitted ? '✅ Yes' : '❌ No'}</p>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-600">
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>Type:</strong> {type}</p>
          </div>
        );
    }
  };

  const relevantEvents = events.filter(event => 
    DEMO_CONFIG.relevantWebhookEvents.includes(event.type)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event monitoring</h1>
                              <p className="text-gray-600 mt-1">{companyName} - Real-time webhooks</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {autoRefresh ? '🔄 Auto-refresh enabled' : '⏸️ Auto-refresh disabled'}
              </button>
              {autoRefresh && (
                <span className="text-xs text-gray-500">
                  Automatic refresh occurs every 5 seconds
                </span>
              )}
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

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                            <p><strong>Total events:</strong> {events.length}</p>
            <p><strong>Relevant events:</strong> {relevantEvents.length}</p>
                                  <p><strong>Last refresh:</strong> {formatTimestamp(lastRefresh.toISOString())}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </div>
                ) : (
                  '🔄 Refresh'
                )}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => document.getElementById('test-dropdown')?.classList.toggle('hidden')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  🧪 Test Event
                </button>
                <div id="test-dropdown" className="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                  <div className="p-2">
                    <p className="text-xs text-gray-600 mb-2">Create test event:</p>
                    <button
                      onClick={() => createTestEvent('issuing_authorization.created')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      🔒 Authorization Created
                    </button>
                    <button
                      onClick={() => createTestEvent('issuing_card.created')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      💳 Card Created
                    </button>
                    <button
                      onClick={() => createTestEvent('issuing_cardholder.created')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      👤 Cardholder Created
                    </button>
                    <button
                      onClick={() => createTestEvent('account.updated')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      🏢 Account Updated
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={clearEvents}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No webhook events</h3>
              <p className="text-gray-600 mb-4">
                Webhook events will appear here in real-time during actions on cards and accounts.
              </p>
              <div className="text-sm text-gray-500">
                <p>Monitored events:</p>
                <p className="mt-1">
                  {DEMO_CONFIG.relevantWebhookEvents.map(event => getEventIcon(event)).join(' ')} 
                  {DEMO_CONFIG.relevantWebhookEvents.join(', ')}
                </p>
              </div>
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${getEventColor(event.type)} p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getEventIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getEventTitle(event.type)}
                        </h3>
                        {DEMO_CONFIG.relevantWebhookEvents.includes(event.type) && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            ⭐ Relevant
                          </span>
                        )}
                      </div>
                      {getEventDetails(event)}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatTimestamp(event.timestamp)}</p>
                    <p className="font-mono text-xs mt-1">{event.id}</p>
                    {event.account && (
                      <p className="font-mono text-xs text-blue-600">
                        {event.account.substring(0, 18)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📡 About webhooks</h3>
          <div className="space-y-2 text-blue-800 text-sm">
                    <p>• Webhooks allow receiving real-time notifications for Stripe events</p>
        <p>• This page displays events related to cards, cardholders and authorizations</p>
                          <p>• Auto-refresh happens every 5 seconds</p>
            <p>• Events relevant to the demo are highlighted</p>
            <p>• Webhook URL: <code className="bg-blue-100 px-1 rounded">/api/webhooks</code></p>
          </div>
        </div>
      </div>
    </div>
  );
} 