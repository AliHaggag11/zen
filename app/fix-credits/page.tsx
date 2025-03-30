'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/lib/supabase/provider';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

export default function FixCreditsPage() {
  const { } = useSupabase();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixCredits = async () => {
    setIsFixing(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/fix-credits', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to fix credits');
      } else {
        setResult(data);
        // Credits functionality has been removed
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fixing credits:', err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="font-bold text-teal-500 text-2xl">ZenSpace</div>
              <div className="text-sm text-gray-500 ml-2">Fix Credits</div>
            </div>
            <Link href="/dashboard" className="text-teal-500 hover:text-teal-600">
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Fix Credit Issues</h1>
            <p className="text-gray-600 mb-6">
              Credits functionality has been removed from the application.
              Please return to the dashboard.
            </p>
            
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 