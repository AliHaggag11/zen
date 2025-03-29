'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Card from '../components/ui/Card';
import JournalEntryForm from './components/JournalEntryForm';
import JournalEntry from './components/JournalEntry';
import EmptyJournal from './components/EmptyJournal';
import JournalTips from './components/JournalTips';
import { useTheme } from '../lib/themeContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  mood?: string;
  tags?: string[];
}

export default function JournalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '', tags: '' });
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchJournalEntries(session.user.id);
      }
      setLoading(false);
    };
    
    getUser();
  }, [supabase]);

  const fetchJournalEntries = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setError('Failed to load journal entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createJournalEntry = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      if (!newEntry.title.trim() || !newEntry.content.trim()) {
        setError('Please enter both a title and content for your journal entry.');
        return;
      }
      
      // Process tags if provided
      const tags = newEntry.tags 
        ? newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood || null,
          tags: tags.length > 0 ? tags : null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new entry to the entries list
      setEntries([data, ...entries]);
      
      // Reset form
      setNewEntry({ title: '', content: '', mood: '', tags: '' });
      setShowEntryForm(false);
      
      // Show success message
      setSuccess('Journal entry saved successfully!');
      setTimeout(() => setSuccess(null), 3000);

      // Mark "Journaling" activity as completed
      await markJournalingAsCompleted();
      
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateJournalEntry = async () => {
    if (!user || !editingEntry) return;
    
    try {
      setSaving(true);
      
      if (!editingEntry.title.trim() || !editingEntry.content.trim()) {
        setError('Please enter both a title and content for your journal entry.');
        return;
      }
      
      // Process tags if provided
      const tagInput = typeof editingEntry.tags === 'string' 
        ? editingEntry.tags
        : Array.isArray(editingEntry.tags) 
          ? editingEntry.tags.join(', ') 
          : '';
      
      const tags: string[] = tagInput
        ? tagInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: editingEntry.title,
          content: editingEntry.content,
          mood: editingEntry.mood || null,
          tags: tags.length > 0 ? tags : null
        })
        .eq('id', editingEntry.id);
      
      if (error) throw error;
      
      // Update the entry in the entries list
      const updatedEntry: JournalEntry = {
        ...editingEntry,
        title: editingEntry.title,
        content: editingEntry.content,
        mood: editingEntry.mood || undefined,
        tags: tags.length > 0 ? tags : []
      };
      
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      ));
      
      // Reset form
      setEditingEntry(null);
      
      // Show success message
      setSuccess('Journal entry updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error updating journal entry:', error);
      setError('Failed to update journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteJournalEntry = async (entryId: string) => {
    if (!user) return;
    
    try {
      const confirmed = window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.');
      if (!confirmed) return;
      
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
      
      // Remove the entry from the entries list
      setEntries(entries.filter(entry => entry.id !== entryId));
      
      // Show success message
      setSuccess('Journal entry deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setError('Failed to delete journal entry. Please try again.');
    }
  };

  const markJournalingAsCompleted = async () => {
    if (!user) return;
    
    try {
      // Find the Journaling activity
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', 'Journaling');
      
      if (!activities || activities.length === 0) return;
      
      const activity = activities[0];
      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = activity.last_completed ? activity.last_completed.split('T')[0] : null;
      
      // Check if already completed today
      if (lastCompleted === today) return;
      
      // Calculate new streak
      let newStreak = activity.streak || 0;
      
      // Check if the last completion was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastCompleted === yesterdayStr) {
        // Completed yesterday, increment streak
        newStreak += 1;
      } else if (!lastCompleted) {
        // First time completing, start streak
        newStreak = 1;
      } else {
        // Streak broken, restart
        newStreak = 1;
      }
      
      // Update the activity
      await supabase
        .from('user_activities')
        .update({
          completed: true,
          streak: newStreak,
          last_completed: new Date().toISOString()
        })
        .eq('id', activity.id);
      
    } catch (error) {
      console.error('Error marking journaling as completed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Journal</h1>
              <p className="text-foreground/70">Capture your thoughts, feelings, and experiences</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => {
                  setShowEntryForm(!showEntryForm);
                  setEditingEntry(null);
                  if (!showEntryForm) {
                    setNewEntry({ title: '', content: '', mood: '', tags: '' });
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {showEntryForm ? 'Cancel' : 'New Entry'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
              {success}
            </div>
          )}
          
          {/* Journal Entry Form */}
          {showEntryForm && (
            <JournalEntryForm
              title={newEntry.title}
              content={newEntry.content}
              mood={newEntry.mood}
              tags={newEntry.tags}
              onTitleChange={(value) => setNewEntry({ ...newEntry, title: value })}
              onContentChange={(value) => setNewEntry({ ...newEntry, content: value })}
              onMoodChange={(value) => setNewEntry({ ...newEntry, mood: value })}
              onTagsChange={(value) => setNewEntry({ ...newEntry, tags: value })}
              onSubmit={createJournalEntry}
              onCancel={() => setShowEntryForm(false)}
              isSaving={saving}
            />
          )}
          
          {/* Edit Journal Entry Form */}
          {editingEntry && (
            <JournalEntryForm
              title={editingEntry.title}
              content={editingEntry.content}
              mood={editingEntry.mood || ''}
              tags={Array.isArray(editingEntry.tags) ? editingEntry.tags.join(', ') : editingEntry.tags || ''}
              onTitleChange={(value) => setEditingEntry({ ...editingEntry, title: value })}
              onContentChange={(value) => setEditingEntry({ ...editingEntry, content: value })}
              onMoodChange={(value) => setEditingEntry({ ...editingEntry, mood: value })}
              onTagsChange={(value) => setEditingEntry({ ...editingEntry, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
              onSubmit={updateJournalEntry}
              onCancel={() => setEditingEntry(null)}
              isEdit={true}
              isSaving={saving}
            />
          )}
          
          {/* Journal Entries List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <EmptyJournal onCreateFirst={() => setShowEntryForm(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {entries.map((entry) => (
                <JournalEntry
                  key={entry.id}
                  id={entry.id}
                  title={entry.title}
                  content={entry.content}
                  createdAt={entry.created_at}
                  mood={entry.mood}
                  tags={entry.tags}
                  onEdit={() => {
                    setEditingEntry(entry);
                    setShowEntryForm(false);
                  }}
                  onDelete={() => deleteJournalEntry(entry.id)}
                />
              ))}
            </div>
          )}
          
          {/* Tips for Effective Journaling */}
          <JournalTips />
        </div>
      </main>
    </ProtectedRoute>
  );
} 