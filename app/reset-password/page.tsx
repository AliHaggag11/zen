'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTheme } from '../lib/themeContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Check if we have a session (which means the user clicked the reset link)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage('Invalid or expired password reset link. Please request a new password reset.');
      }
    };

    checkSession();
  }, [supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setMessage('Your password has been updated successfully. Redirecting to login...');
      
      // Redirect after successful password reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-xl shadow-lg border border-primary/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Reset Your Password</h1>
          <p className="mt-2 text-foreground/70">Enter your new password below</p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-green-100 text-green-700 border border-green-200">
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 