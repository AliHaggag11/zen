'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './providers';
import { Button } from './ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, setUser } = useApp();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/chat', label: 'AI Chat' },
    { href: '/mood-tracker', label: 'Mood Tracker' },
    { href: '/resources', label: 'Resources' },
    { href: '/community', label: 'Community' },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Zen Space
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setUser(null)}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 