'use client';

import { useEffect } from 'react';
import { clearDemoState } from '@/lib/storage';

export default function ResetPage() {
  useEffect(() => {
    // Clear all demo state
    clearDemoState();
    
    // Log for debugging
    console.log('Demo state has been reset');
    
    // Redirect to homepage after a short delay
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
         }}>
      <div className="text-center p-8 rounded-lg bg-white/10 backdrop-blur-sm text-white">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Resetting Demo...</h2>
        <p className="text-white/80">Clearing all demo data and redirecting to homepage...</p>
      </div>
    </div>
  );
} 