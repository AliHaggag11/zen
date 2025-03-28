'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../lib/themeContext';
import MoodTracker from '../components/ui/MoodTracker';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../lib/supabase/database.types';

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const { currentTheme, setThemeBasedOnMood } = useTheme();
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    const fetchMoodHistory = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch mood history from Supabase (this is a placeholder)
        // Replace with actual table and query once implemented
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(7);
        
        if (data) {
          setMoodHistory(data);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchMoodHistory();
  }, [supabase]);
  
  const handleMoodSelected = async (moodLevel: number) => {
    setSelectedMood(moodLevel);
    setThemeBasedOnMood(moodLevel);
    
    // Save mood to Supabase (this is a placeholder)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Insert mood entry into Supabase
      // Replace with actual table once implemented
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: session.user.id,
          mood_level: moodLevel,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving mood:', error);
      } else {
        // Refresh mood history
        const { data: updatedHistory } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(7);
        
        if (updatedHistory) {
          setMoodHistory(updatedHistory);
        }
      }
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Mood Tracker</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">How are you feeling today?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <MoodTracker 
                onMoodSelected={handleMoodSelected}
              />
              
              <div className="bg-primary/5 rounded-lg p-8 border border-primary/10">
                <h3 className="text-xl font-medium text-foreground mb-4">Your Mood Profile</h3>
                <p className="text-foreground/80 mb-6">
                  Track your emotional well-being over time. Regular tracking helps you identify patterns
                  and gain insights into factors that influence your mood.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground/70">Current Mood:</span>
                      <span className="font-medium text-primary capitalize">
                        {selectedMood ? 
                          selectedMood === 1 ? 'Very Low' : 
                          selectedMood === 2 ? 'Low' : 
                          selectedMood === 3 ? 'Neutral' : 
                          selectedMood === 4 ? 'Good' : 
                          'Excellent' : 'Not Selected'}
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: selectedMood ? `${(selectedMood / 5) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Mood History</h2>
            <div className="bg-background rounded-lg p-8 shadow-md border border-primary/10">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : moodHistory.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-7 gap-3 mb-4">
                    {moodHistory.map((entry, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-full h-40 rounded-lg" 
                          style={{ 
                            background: `linear-gradient(to top, var(--primary) ${(entry.mood_level / 5) * 100}%, transparent ${(entry.mood_level / 5) * 100}%)`,
                            opacity: 0.7 + (0.3 * (entry.mood_level / 5))
                          }}
                        ></div>
                        <span className="text-xs text-foreground/60 mt-2">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-foreground/70 text-sm">
                    Your mood has been tracked for the past {moodHistory.length} days. Keep logging daily to see more insights.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground/70">No mood data recorded yet. Start tracking your mood daily!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
} 