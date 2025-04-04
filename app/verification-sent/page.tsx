'use client';

import Link from 'next/link';
import { useTheme } from '../lib/themeContext';
import { useState, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams } from 'next/navigation';

function VerificationContent() {
  const { currentTheme } = useTheme();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const supabase = createClientComponentClient();

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw error;
      }

      setResendSuccess(true);
    } catch (error: unknown) {
      setResendError(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-xl shadow-lg border border-primary/10 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Verification Email Sent</h1>
        
        <p className="text-foreground/70">
          We&apos;ve sent a verification email to <span className="font-medium text-primary">{email}</span>.
          Please check your inbox and click the link to verify your account.
        </p>

        {resendSuccess && (
          <div className="p-4 rounded-lg bg-green-100 text-green-700 border border-green-200 text-sm">
            Verification email has been resent successfully.
          </div>
        )}

        {resendError && (
          <div className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
            {resendError}
          </div>
        )}

        <div className="space-y-4 pt-4">
          <button
            onClick={handleResendEmail}
            disabled={isResending || !email}
            className="w-full flex justify-center py-3 px-4 border border-primary/20 rounded-lg shadow-sm text-primary bg-primary/5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isResending ? 'Resending...' : 'Resend verification email'}
          </button>

          <Link
            href="/login"
            className="block w-full text-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
          >
            Back to login
          </Link>
        </div>

        <div className="mt-6 text-sm text-foreground/50">
          <p>
            If you don&apos;t see the email, check your spam folder or{' '}
            <Link href="/contact" className="text-primary hover:text-primary/80">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerificationSent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationContent />
    </Suspense>
  );
} 