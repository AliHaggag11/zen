'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../lib/themeContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../lib/supabase/database.types';
import { cn } from '../lib/utils';
import { MoodEntry, MoodLevel } from '../lib/types';
import MoodEntryForm from '../components/ui/MoodEntryForm';
import MoodHistoryView from '../components/ui/MoodHistoryView';
import MoodEntryDetail from '../components/ui/MoodEntryDetail';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoodTrackerPage() {
  // Authentication
  const [user, setUser] = useState<User | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'track' | 'history'>('track');
  
  // Entry states
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  
  const { setThemeBasedOnMood } = useTheme();
  const supabase = createClientComponentClient<Database>();
  
  // Fetch user and mood entries on mount
  useEffect(() => {
    const fetchUserAndMoodEntries = async () => {
      setIsLoading(true);
      
      try {
        // Get session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
          setUser(session.user);
          
          // Fetch mood entries
          const { data: entriesData, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          if (entriesData) {
            // Parse JSON fields
            const parsedEntries = entriesData.map(entry => ({
              ...entry,
              activities: entry.activities ? JSON.parse(entry.activities as unknown as string) : [],
              tags: entry.tags ? JSON.parse(entry.tags as unknown as string) : []
            })) as MoodEntry[];
            
            setMoodEntries(parsedEntries);
          }
        }
      } catch (error) {
        console.error('Error fetching mood entries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndMoodEntries();
  }, [supabase]);
  
  // Save a new mood entry
  const saveMoodEntry = async (entry: {
    mood_level: MoodLevel;
    notes: string;
    activities: string[];
    tags: string[];
  }) => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Create entry object
      const newEntry: MoodEntry = {
        user_id: user.id,
        mood_level: entry.mood_level,
        notes: entry.notes,
        activities: entry.activities,
        tags: entry.tags,
        created_at: new Date().toISOString()
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: newEntry.user_id,
          mood_level: newEntry.mood_level,
          notes: newEntry.notes || null,
          activities: entry.activities.length > 0 ? JSON.stringify(entry.activities) : null,
          tags: entry.tags.length > 0 ? JSON.stringify(entry.tags) : null,
          created_at: newEntry.created_at
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Add the new entry to state
        const parsedEntry = {
          ...data,
          activities: data.activities ? JSON.parse(data.activities as unknown as string) : [],
          tags: data.tags ? JSON.parse(data.tags as unknown as string) : []
        } as MoodEntry;
        
        setMoodEntries([parsedEntry, ...moodEntries]);
        
        // Auto-switch to history tab
        setTimeout(() => {
          setActiveTab('history');
        }, 800);
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update an existing mood entry
  const updateMoodEntry = async (updatedEntry: MoodEntry) => {
    if (!user || !updatedEntry.id) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('mood_entries')
        .update({
          notes: updatedEntry.notes || null,
          activities: updatedEntry.activities && updatedEntry.activities.length > 0 
            ? JSON.stringify(updatedEntry.activities) 
            : null,
          tags: updatedEntry.tags && updatedEntry.tags.length > 0 
            ? JSON.stringify(updatedEntry.tags) 
            : null
        })
        .eq('id', updatedEntry.id);
      
      if (error) throw error;
      
      // Update in local state
      setMoodEntries(moodEntries.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));
      
      // Update selected entry if it's the one being edited
      if (selectedEntry && selectedEntry.id === updatedEntry.id) {
        setSelectedEntry(updatedEntry);
      }
    } catch (error) {
      console.error('Error updating mood entry:', error);
      throw error;
    }
  };
  
  // Delete a mood entry
  const deleteMoodEntry = async (entry: MoodEntry) => {
    if (!user || !entry.id) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entry.id);
      
      if (error) throw error;
      
      // Remove from local state
      setMoodEntries(moodEntries.filter(e => e.id !== entry.id));
      
      // Close detail view if it's the one being deleted
      if (selectedEntry && selectedEntry.id === entry.id) {
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }
  };
  
  // View a mood entry in detail
  const viewMoodEntry = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    
    // Set theme based on the entry's mood
    setThemeBasedOnMood(entry.mood_level);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-6">Mood Tracker</h1>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-foreground/10 mb-8">
            <button
              onClick={() => setActiveTab('track')}
              className={cn(
                "px-6 py-3 font-medium text-base transition-colors relative",
                activeTab === 'track' 
                  ? "text-primary" 
                  : "text-foreground/60 hover:text-foreground/80"
              )}
            >
              Track Mood
              {activeTab === 'track' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="activeTab"
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-6 py-3 font-medium text-base transition-colors relative",
                activeTab === 'history' 
                  ? "text-primary" 
                  : "text-foreground/60 hover:text-foreground/80"
              )}
            >
              Mood History
              {activeTab === 'history' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="activeTab"
                />
              )}
            </button>
            </div>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'track' ? (
              <motion.div
                key="track"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <MoodEntryForm 
                  onSave={saveMoodEntry}
                  isLoading={isSaving}
                />
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <MoodHistoryView 
                  entries={moodEntries}
                  isLoading={isLoading}
                  onEntryClick={viewMoodEntry}
                />
              </motion.div>
            )}
          </AnimatePresence>
                </div>
        
        {/* Entry Detail Modal */}
        <AnimatePresence>
          {selectedEntry && (
            <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <MoodEntryDetail 
                  entry={selectedEntry}
                  onClose={() => setSelectedEntry(null)}
                  onUpdate={updateMoodEntry}
                  onDelete={deleteMoodEntry}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </ProtectedRoute>
  );
} 