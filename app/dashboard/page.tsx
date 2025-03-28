'use client';

import { useState } from 'react';
import MoodTracker from '../components/ui/MoodTracker';
import { useTheme } from '../lib/themeContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const { currentTheme, setThemeBasedOnMood } = useTheme();
  
  const handleMoodSelected = (moodLevel: number) => {
    setSelectedMood(moodLevel);
    setThemeBasedOnMood(moodLevel);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Dashboard</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">How are you feeling today?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <MoodTracker 
                onMoodSelected={handleMoodSelected}
              />
              
              <div className="bg-primary/5 rounded-lg p-8 border border-primary/10">
                <h3 className="text-xl font-medium text-foreground mb-4">Theme Customization</h3>
                <p className="text-foreground/80 mb-6">
                  This dashboard demonstrates the dynamic theme system. As you select different moods, 
                  the interface adapts to create an environment that resonates with how you feel.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground/70">Current Theme:</span>
                      <span className="font-medium text-primary capitalize">{currentTheme}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: selectedMood ? `${(selectedMood / 5) * 100}%` : '60%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/60">
                    {currentTheme === 'calm' && 'The calm theme uses cool blues and gentle gradients to create a soothing experience.'}
                    {currentTheme === 'happy' && 'The happy theme uses bright, warm colors to enhance your positive mood.'}
                    {currentTheme === 'sad' && 'The sad theme offers softer, comforting colors to provide gentle support.'}
                    {currentTheme === 'energetic' && 'The energetic theme uses vibrant colors to match your high energy level.'}
                    {currentTheme === 'neutral' && 'The neutral theme uses balanced colors for a calm, focused experience.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-8 shadow-md border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-foreground">Recent Activity</h3>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">New</span>
              </div>
              
              <ul className="space-y-4">
                <li className="border-b border-primary/10 pb-4">
                  <p className="text-foreground font-medium">Mood tracked</p>
                  <p className="text-foreground/60 text-sm">Today at 9:30 AM</p>
                </li>
                <li className="border-b border-primary/10 pb-4">
                  <p className="text-foreground font-medium">Completed breathing exercise</p>
                  <p className="text-foreground/60 text-sm">Yesterday at 8:15 PM</p>
                </li>
                <li>
                  <p className="text-foreground font-medium">Updated profile</p>
                  <p className="text-foreground/60 text-sm">2 days ago</p>
                </li>
              </ul>
            </div>
            
            <div className="bg-background rounded-lg p-8 shadow-md border border-primary/10">
              <h3 className="text-xl font-medium text-foreground mb-6">Mood Insights</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/70">Weekly Average</span>
                    <span className="font-medium text-primary">3.8/5</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/70">Monthly Trend</span>
                    <span className="font-medium text-green-500">↑ 12%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-4/5"></div>
                  </div>
                </div>
                
                <p className="text-sm text-foreground/60">
                  Your mood has been improving over the past 30 days. Keep up the good work!
                </p>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-8 shadow-md border border-primary/10">
              <h3 className="text-xl font-medium text-foreground mb-6">Recommended</h3>
              
              <ul className="space-y-4">
                <li className="border-b border-primary/10 pb-4">
                  <p className="text-foreground font-medium">5-Minute Meditation</p>
                  <p className="text-foreground/60 text-sm">Quick relaxation technique</p>
                </li>
                <li className="border-b border-primary/10 pb-4">
                  <p className="text-foreground font-medium">Gratitude Journal</p>
                  <p className="text-foreground/60 text-sm">Record things you're thankful for</p>
                </li>
                <li>
                  <p className="text-foreground font-medium">Evening Reflection</p>
                  <p className="text-foreground/60 text-sm">Review your day with mindfulness</p>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
} 