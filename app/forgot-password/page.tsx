'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useTheme } from '../lib/themeContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClientComponentClient();
  const { currentTheme } = useTheme();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-xl shadow-lg border border-primary/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Reset Your Password</h1>
          <p className="mt-2 text-foreground/70">
            {success
              ? 'Check your email for the reset link'
              : 'Enter your email address to receive a password reset link'}
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-8">
            <div className="p-4 rounded-lg bg-green-100 text-green-700 border border-green-200 text-sm">
              We've sent a password reset link to <span className="font-medium">{email}</span>.
              Please check your inbox and follow the instructions to reset your password.
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-foreground/70">
                Didn't receive the email? Check your spam folder or request another reset link.
              </p>
              
              <button
                onClick={(e) => handleResetRequest(e)}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-primary/20 rounded-lg shadow-sm text-primary bg-primary/5 hover:bg-primary/10 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Resend reset link'}
              </button>
              
              <Link
                href="/login"
                className="block text-center w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 transition"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-primary hover:text-primary/80 text-sm">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 