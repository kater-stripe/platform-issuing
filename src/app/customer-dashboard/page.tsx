'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface AccountStatus {
  business_profile?: {
    name?: string;
  };
}

interface Balance {
  issuing?: {
    available: Array<{ amount: number; currency: string }>;
  };
}

export default function CustomerDashboard() {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accountId = searchParams.get('account_id') || localStorage.getItem('demo-account-id');
    if (accountId) {
      fetchAccountStatus(accountId);
      fetchBalance(accountId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchAccountStatus = async (accountId: string) => {
    // ... fetch account status ...
  };

  const fetchBalance = async (accountId: string) => {
    // ... fetch balance ...
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 bg-hibob-background">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1">
          {/* Virtual Card */}
          <div className="bg-gray-800 text-white p-6 rounded-lg">
            <p className="text-sm">Virtual Card</p>
            <p className="text-lg font-semibold">Marketing Team</p>
            <div className="my-4">
              <p className="text-xs">Available Balance</p>
              <p className="text-3xl font-bold">
                {balance?.issuing?.available?.[0] 
                  ? formatCurrency(balance.issuing.available[0].amount)
                  : '$0.00'
                }
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs">**** **** **** 1234</p>
                <p className="text-xs">SARAH JOHNSON</p>
              </div>
              <div>
                <p className="text-xs">VALID THRU: **/**</p>
                <p className="text-xs">CVV: ***</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            {['Issue Virtual Card', 'Send Payment', 'Pay Bill', 'Manage Team', 'Add Funds', 'Vendor Setup'].map(action => (
              <div key={action} className="bg-white p-4 rounded-lg text-center shadow-sm">
                <p className="font-semibold">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-8 mt-8">
        {['Total Spend', 'Active Cards', 'Pending Bills', 'Employees'].map(stat => (
          <div key={stat} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-500">{stat}</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        ))}
      </div>
    </div>
  );
} 