'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/lib/themeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      
      // If we're on the homepage and user is signed in, redirect to dashboard
      if (newSession && pathname === '/') {
        router.push('/dashboard');
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        // If we're on the homepage and user is signed in, redirect to dashboard
        if (data.session && pathname === '/') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  // Handle clicking outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Define navigation links based on authentication state
  const getNavLinks = () => {
    if (session) {
      // Links for authenticated users
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/mood-tracker', label: 'Mood Tracker' },
        { href: '/wellness', label: 'Activities' },
        { href: '/chat', label: 'Chat' },
      ];
    } else {
      // Links for unauthenticated users
      return [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/features', label: 'Features' },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-background/70 backdrop-blur-md border-b border-primary/10 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href={session ? '/dashboard' : '/'} className="flex items-center group relative">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-md group-hover:shadow-lg transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M18 16c0-4-4-7.8-4-12 0 4.2-4 8-4 12a4 4 0 1 0 8 0Z" />
                    <path d="M17 17.5a9 9 0 1 0-10 0" />
                  </svg>
                </div>
                <motion.div 
                  className="absolute -top-2 -right-2 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      "0 1px 2px rgba(0, 0, 0, 0.1)",
                      "0 2px 8px rgba(0, 0, 0, 0.2)",
                      "0 1px 2px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{ 
                    scale: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 2,
                      repeatDelay: 3
                    },
                    boxShadow: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 2,
                      repeatDelay: 3
                    },
                    delay: 1.5
                  }}
                >
                  BETA
                </motion.div>
              </div>
              <div className="flex flex-col ml-2.5">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-primary leading-none tracking-tight">ZenSpace</span>
                </div>
                <span className="text-xs text-foreground/50 leading-none">Mental Wellness</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium relative overflow-hidden ${
                    pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                  } transition-all duration-300`}
                >
                  {pathname === link.href && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Auth Buttons or User Menu */}
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {session ? (
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      href="/profile"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-primary/20 text-foreground hover:bg-primary/5 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
            
            {/* Mobile menu button */}
            <motion.button 
              className="p-2 rounded-lg hover:bg-primary/10 focus:outline-none transition-colors mobile-menu-button md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="h-6 w-6 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background/90 backdrop-blur-lg border-b border-primary/10 mobile-menu-container overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-4 pb-4 border-b border-primary/5"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M18 16c0-4-4-7.8-4-12 0 4.2-4 8-4 12a4 4 0 1 0 8 0Z" />
                        <path d="M17 17.5a9 9 0 1 0-10 0" />
                      </svg>
                    </div>
                    <span className="ml-2 text-lg font-bold text-primary leading-none tracking-tight">ZenSpace</span>
                    <motion.span 
                      className="ml-1.5 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      animate={{ 
                        scale: [1, 1.15, 1],
                        boxShadow: [
                          "0 1px 2px rgba(0, 0, 0, 0.1)",
                          "0 2px 8px rgba(0, 0, 0, 0.2)",
                          "0 1px 2px rgba(0, 0, 0, 0.1)"
                        ]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 2,
                        repeatDelay: 3,
                        delay: 2
                      }}
                    >
                      BETA
                    </motion.span>
                  </div>
                </motion.div>

                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg text-base font-medium ${
                        pathname === link.href
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                      } transition-colors`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="border-t border-primary/10 pt-3 mt-2"
                >
                  {session ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 rounded-lg text-base font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3 px-4 py-3">
                      <Link
                        href="/login"
                        className="block w-full py-3 rounded-lg text-center text-base font-medium border border-primary/20 text-foreground hover:bg-primary/5 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full py-3 rounded-lg text-center text-base font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 