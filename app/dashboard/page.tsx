'use client';

import { useState, useEffect } from 'react';
import { ThemeButton } from '../components/ui/ThemeButton';
import Card from '../components/ui/Card';
import Link from 'next/link';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UserWellnessReport from '../components/ui/UserWellnessReport';
import { User } from '@supabase/supabase-js';
import MoodTracker from '../components/ui/MoodTracker';
import MindfulMovementCard from '../components/ui/MindfulMovementCard';
import VideoModal from '../components/ui/VideoModal';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<{[key: string]: number}>({});
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({ url: '', title: '' });
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

  useEffect(() => {
    const fetchRecentMoods = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        if (data) setRecentMoods(data);
      } catch (error) {
        console.error('Error fetching recent moods:', error);
      }
    };
    
    const fetchActivityStreaks = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true);
          
        if (error) throw error;
        
        if (data) {
          const streaks: {[key: string]: number} = {};
          data.forEach(activity => {
            streaks[activity.title] = activity.streak || 0;
          });
          setStreakData(streaks);
        }
      } catch (error) {
        console.error('Error fetching activity streaks:', error);
      }
    };
    
    if (user) {
      fetchRecentMoods();
      fetchActivityStreaks();
    }
  }, [user, supabase]);
  
  const handleVideoClick = (url: string, title: string) => {
    setCurrentVideo({ url, title });
    setVideoModalOpen(true);
  };
  
  // Mindful movement resources
  const mindfulMovements = [
    {
      title: "Morning Stretch",
      description: "5-minute gentle stretching routine to start your day",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoTitle: "Morning Stretch Routine"
    },
    {
      title: "Desk Yoga",
      description: "Quick stretches you can do at your desk to relieve tension",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoTitle: "Desk Yoga for Stress Relief"
    },
    {
      title: "Gentle Flow",
      description: "10-minute gentle flow to improve flexibility and mindfulness",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoTitle: "Gentle Mindful Flow Session"
    }
  ];

  // More subtle streak indicator
  const getStreakDisplay = (streak: number) => {
    if (streak <= 0) return "";
    return `${streak} day streak`;
  };
  
  return (
    <ProtectedRoute>
      <main className="min-h-screen p-4 md:p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Dashboard</h1>
              <p className="text-foreground/70 text-sm">Welcome back, {user?.user_metadata?.name || 'User'}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <ThemeButton />
            </div>
          </div>
          
          {/* Dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Wellness Report + Quick Actions on mobile */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Wellness Report */}
              <UserWellnessReport user={user} />
              
              {/* Mindful Movement Section */}
              <Card className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-medium">Mindful Movement</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mindfulMovements.map((movement, index) => (
                      <MindfulMovementCard
                        key={index}
                        title={movement.title}
                        description={movement.description}
                        videoUrl={movement.videoUrl}
                        videoTitle={movement.videoTitle}
                        onVideoClick={handleVideoClick}
                      />
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Daily Progress */}
              <Card className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-medium">Daily Wellness Progress</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/breathing" className="block">
                      <div className="p-5 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Breathing Exercise</h3>
                          {streakData['Deep Breathing'] > 0 && (
                            <span className="text-xs text-primary font-medium">
                              {getStreakDisplay(streakData['Deep Breathing'])}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70">3-minute breathing practice for focus and calm</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-1 text-primary text-sm">
                            <span>Begin session</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/mindfulness" className="block">
                      <div className="p-5 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Mindfulness</h3>
                          {streakData['Daily Mindfulness'] > 0 && (
                            <span className="text-xs text-primary font-medium">
                              {getStreakDisplay(streakData['Daily Mindfulness'])}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70">Guided practice for present-moment awareness</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-1 text-primary text-sm">
                            <span>Begin session</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/mood" className="block">
                      <div className="p-5 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Mood Recording</h3>
                          {recentMoods.length > 0 && (
                            <span className="text-xs text-primary font-medium">Updated today</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70">Track emotional patterns for greater self-awareness</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-1 text-primary text-sm">
                            <span>Record mood</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              {/* Quick Actions Panel */}
              <Card className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-medium">Quick Access</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  <Link href="/chat" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-full bg-primary/10 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Therapeutic Chat</h3>
                      <p className="text-sm text-foreground/70 mt-0.5">Process thoughts and emotions</p>
                    </div>
                  </Link>
                  
                  <Link href="/profile" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-full bg-primary/10 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Profile Settings</h3>
                      <p className="text-sm text-foreground/70 mt-0.5">Manage your account</p>
                    </div>
                  </Link>
                  
                  <Link href="/wellness" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-full bg-primary/10 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">Wellness Activities</h3>
                        <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">New</span>
                      </div>
                      <p className="text-sm text-foreground/70 mt-0.5">View all mental wellness tools</p>
                    </div>
                  </Link>
                </div>
              </Card>
              
              {/* Unified Mood Panel - combines mood tracking and theme selection */}
              <Card className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-medium">Mood & Preferences</h2>
                </div>
                <div className="p-6">
                  <MoodTracker 
                    className="mb-6"
                    hideDescription={true}
                    onMoodSelected={(mood) => {
                      // This will be handled by the MoodTracker component
                    }}
                  />
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-sm text-foreground/80">Interface Theme</h3>
                      <Link href="/mood/settings" className="text-xs text-primary hover:underline">Customize</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ThemeButton mood="serene" />
                      <ThemeButton mood="vibrant" />
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Recent Moods */}
              <Card className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-medium">Recent Entries</h2>
                  {recentMoods.length > 0 && (
                    <Link href="/mood/history" className="text-sm text-primary hover:underline">
                      View all
                    </Link>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {recentMoods.length > 0 ? (
                    <>
                      {recentMoods.map((mood, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <span>{mood.emoji || '😊'}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">{mood.mood_name || 'Mood'}</span>
                                <span className="text-xs text-foreground/60">
                                  {new Date(mood.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/70 line-clamp-1 mt-0.5">{mood.notes || 'No notes'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-foreground/60 mb-4">No mood entries recorded yet</p>
                      <Link href="/mood" className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors">
                        Record Your First Entry
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Video Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={currentVideo.url}
        title={currentVideo.title}
      />
    </ProtectedRoute>
  );
} 