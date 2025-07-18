'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get account ID from localStorage
    const accountId = localStorage.getItem('demo-account-id');
    
    if (accountId) {
      // Redirect to customer-dashboard with account_id parameter
      router.replace(`/customer-dashboard?account_id=${accountId}`);
    } else {
      // If no account ID, redirect to onboarding
      router.replace('/onboarding');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your dashboard</p>
      </div>
    </div>
  );
} 