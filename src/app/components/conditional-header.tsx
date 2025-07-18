'use client';

import { usePathname } from 'next/navigation';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header only on homepage
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="w-full">
      <div 
        className="w-full h-32 flex items-center justify-center"
        style={{
          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)'
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-2xl md:text-3xl font-bold opacity-90">
            Stripe Connect & Issuing Demo
          </h1>
          <p className="text-sm opacity-75 mt-1">
            Issuing Platform Demonstration
          </p>
        </div>
      </div>
    </header>
  );
} 