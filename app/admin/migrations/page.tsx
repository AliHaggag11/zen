'use client';

import { useState } from 'react';
import { useSupabase } from '@/app/lib/supabase/provider';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

export default function MigrationsPage() {
  const { user } = useSupabase();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyMigrations = async () => {
    setStatus('loading');
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/apply-migrations', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to apply migrations');
        return;
      }
      
      setResults(data.results || []);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage('An unexpected error occurred');
      console.error('Migration error:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="font-bold text-teal-500 text-2xl">ZenSpace</div>
              <div className="text-sm text-gray-500 ml-2">Admin</div>
            </div>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Migrations</h1>
              <p className="text-gray-600 mt-1">
                Apply database migrations to fix issues
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Run Migrations</h2>
            <p className="text-gray-600 mb-6">
              This will apply all pending database migrations to fix the credit system. 
              Use this if you're experiencing issues with credits not persisting or duplicating.
            </p>
            
            <div className="flex items-center">
              <button
                onClick={applyMigrations}
                disabled={status === 'loading'}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {status === 'loading' && (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></span>
                )}
                Apply Migrations
              </button>
              
              {status === 'success' && (
                <span className="ml-4 text-green-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Migrations applied successfully
                </span>
              )}
              
              {status === 'error' && (
                <span className="ml-4 text-red-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errorMessage || 'Error applying migrations'}
                </span>
              )}
            </div>
          </div>
          
          {status === 'success' && results.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Migration Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.file}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.success ? (
                            <span className="text-green-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Success
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 