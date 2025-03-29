'use client';

import { useState, useEffect } from 'react';
import { ThemeButton } from '../components/ui/ThemeButton';
import Card from '../components/ui/Card';
import Link from 'next/link';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UserWellnessReport from '../components/ui/UserWellnessReport';
import { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    
    getUser();
  }, [supabase]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-foreground/70">Welcome to your mental wellness dashboard</p>
            </div>
            <ThemeButton />
          </div>
          
          {/* Dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Wellness Report - Takes 2/3 of the space on larger screens */}
            <div className="lg:col-span-2">
              <UserWellnessReport user={user} />
            </div>
            
            {/* Quick Actions Panel */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/chat" className="flex items-center p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <div className="p-2 bg-primary rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Chat with Zen AI</h3>
                      <p className="text-sm text-foreground/70">Talk about your thoughts and feelings</p>
                    </div>
                  </Link>
                  
                  <Link href="/profile" className="flex items-center p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <div className="p-2 bg-primary rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Update Profile</h3>
                      <p className="text-sm text-foreground/70">Manage your account settings</p>
                    </div>
                  </Link>
                  
                  <Link href="/wellness" className="w-full flex items-center p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <div className="p-2 bg-primary rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Wellness Activities</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">New</span>
                      </div>
                      <p className="text-sm text-foreground/70">Track activities to boost your score</p>
                    </div>
                  </Link>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mood Themes</h2>
                <p className="text-sm text-foreground/70 mb-4">
                  Change the app theme based on your current mood
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <ThemeButton mood="calm" />
                  <ThemeButton mood="happy" />
                  <ThemeButton mood="sad" />
                  <ThemeButton mood="energetic" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 