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
      <div className="w-full h-32 flex items-center justify-center bg-pluxee-gradient">
        <div className="text-center text-white">
          {/* Pluxee branding */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-sm font-semibold tracking-wider text-pluxee-green">PLUXEE</div>
            <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
            <div className="text-sm font-medium opacity-80">SnackPack Demo</div>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold opacity-95 font-pluxee">
            SME Benefits Platform
          </h1>
          <p className="text-xs opacity-70 mt-1">
            60-day MVP • Multi-Wallet Benefits • Real-time Authorization
          </p>
        </div>
      </div>
    </header>
  );
} 