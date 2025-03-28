'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../lib/themeContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { currentTheme } = useTheme();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        router.push(`/verification-sent?email=${encodeURIComponent(email)}`);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-xl shadow-lg border border-primary/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
          <p className="mt-2 text-foreground/70">Join the Zen Space community</p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground/80">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition"
              placeholder="John Doe"
            />
          </div>

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
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Password
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
              Confirm password
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foreground/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/60">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="w-full flex items-center justify-center px-4 py-3 border border-foreground/10 rounded-lg shadow-sm bg-background text-foreground hover:bg-foreground/5 transition"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10.001 4.478-10.001 10.001s4.478 10.001 10.001 10.001c8.396 0 10.249-7.85 9.426-11.253l-9.426-0.416z"
                  fill="currentColor"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-foreground/70">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 