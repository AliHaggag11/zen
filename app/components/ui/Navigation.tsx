'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/lib/themeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

export default function Navigation() {
  const pathname = usePathname();
  const { currentTheme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
    });

    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Zen</span>
              <span className="text-xl font-medium text-foreground"> Space</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/'
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                } transition-colors`}
              >
                Home
              </Link>
              
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/dashboard'
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    } transition-colors`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/mood-tracker"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/mood-tracker'
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    } transition-colors`}
                  >
                    Mood Tracker
                  </Link>
                  <Link
                    href="/wellness"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/wellness'
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    } transition-colors`}
                  >
                    Activities
                  </Link>
                  <Link
                    href="/chat"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/chat'
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    } transition-colors`}
                  >
                    Chat
                  </Link>
                </>
              ) : (
                <Link
                  href="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/about'
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                  } transition-colors`}
                >
                  About
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-background text-foreground border border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button className="p-2 rounded-md hover:bg-primary/10 focus:outline-none">
                <svg
                  className="h-6 w-6 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 