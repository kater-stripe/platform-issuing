'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchant = searchParams.get('merchant');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment cancelled</h2>
        
        <p className="text-gray-600 mb-6">
          {merchant 
                      ? `Your payment at ${decodeURIComponent(merchant)} has been cancelled.`
          : 'Your payment has been cancelled.'
          }
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Return to merchant
          </button>
          
          <button
            onClick={() => router.push('/checkout')}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
          >
            Choisir un autre marchand
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> No charges have been made. You can retry your payment at any time.
          </p>
        </div>
      </div>
    </div>
  );
} 