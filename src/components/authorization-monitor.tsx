'use client';

import { useState, useEffect } from 'react';

interface AuthorizationEvent {
  id: string;
  type: 'request' | 'response' | 'created';
  timestamp: string;
  authorizationId: string;
  amount: number;
  currency: string;
  merchant: string;
  mcc: string;
  decision?: 'APPROVED' | 'DECLINED';
  reason?: string;
  processingTime?: number;
}

export default function AuthorizationMonitor() {
  const [events, setEvents] = useState<AuthorizationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time events by polling webhook events
    const pollEvents = async () => {
      try {
        const response = await fetch('/api/webhooks/events');
        const data = await response.json();
        
        if (data.success && data.events) {
          const authEvents = data.events
            .filter((event: any) => event.type.startsWith('issuing_authorization'))
            .map((event: any) => {
              if (event.type === 'issuing_authorization.request') {
                return {
                  id: `${event.id}-request`,
                  type: 'request' as const,
                  timestamp: event.timestamp,
                  authorizationId: event.data.id,
                  amount: event.data.amount,
                  currency: event.data.currency,
                  merchant: event.data.merchant_data?.name || 'Unknown',
                  mcc: event.data.merchant_data?.category || 'Unknown',
                  decision: event.authorization_decision?.approved ? 'APPROVED' : 'DECLINED',
                  reason: event.authorization_decision?.reason,
                  processingTime: event.authorization_decision?.processing_time,
                };
              } else if (event.type === 'issuing_authorization.created') {
                return {
                  id: `${event.id}-created`,
                  type: 'created' as const,
                  timestamp: event.timestamp,
                  authorizationId: event.data.id,
                  amount: event.data.amount,
                  currency: event.data.currency,
                  merchant: event.data.merchant_data?.name || 'Unknown',
                  mcc: event.data.merchant_data?.category || 'Unknown',
                  decision: event.data.approved ? 'APPROVED' : 'DECLINED',
                };
              }
              return null;
            })
            .filter(Boolean)
            .slice(0, 10); // Keep only latest 10 events

          setEvents(authEvents);
        }
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to poll events:', error);
        setIsConnected(false);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollEvents, 2000);
    pollEvents(); // Initial load

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Real-time Authorization Monitor</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⏳</div>
            <p>Waiting for authorization events...</p>
            <p className="text-sm">Try making a payment at one of the checkout pages</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-4 ${
                event.type === 'request' 
                  ? 'border-orange-200 bg-orange-50' 
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {event.type === 'request' ? (
                      <span className="text-orange-600 font-medium">🚨 Authorization Request</span>
                    ) : (
                      <span className="text-blue-600 font-medium">🔒 Authorization Created</span>
                    )}
                    <span className="text-sm text-gray-500">{formatTime(event.timestamp)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono ml-1">{event.authorizationId.slice(-8)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-1">{formatCurrency(event.amount, event.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Merchant:</span>
                      <span className="ml-1">{event.merchant}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">MCC:</span>
                      <span className="ml-1">{event.mcc}</span>
                    </div>
                  </div>

                  {event.decision && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.decision === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.decision === 'APPROVED' ? '✅ APPROVED' : '❌ DECLINED'}
                      </span>
                      {event.reason && (
                        <span className="ml-2 text-sm text-gray-600">{event.reason}</span>
                      )}
                      {event.processingTime && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({event.processingTime}ms)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p><strong>How it works:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>🚨 <strong>Authorization Request:</strong> Real-time webhook from Stripe (must respond &lt;2s)</li>
          <li>🔒 <strong>Authorization Created:</strong> Final result after approval/decline decision</li>
          <li>⏱️ <strong>Processing Time:</strong> Time taken to make authorization decision</li>
          <li>🔄 <strong>Auto-refresh:</strong> Updates every 2 seconds</li>
        </ul>
      </div>
    </div>
  );
} 