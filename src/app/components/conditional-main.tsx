'use client';

import { usePathname } from 'next/navigation';

export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Full screen on homepage, normal styling on other pages
  if (pathname === '/') {
    return <main>{children}</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
} 