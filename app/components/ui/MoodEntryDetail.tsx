'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { MoodEntry, MoodLevel, MOOD_DATA, COMMON_ACTIVITIES, COMMON_EMOTIONS } from '@/app/lib/types';
import { motion } from 'framer-motion';

interface MoodEntryDetailProps {
  entry: MoodEntry;
  onClose: () => void;
  onUpdate?: (updatedEntry: MoodEntry) => Promise<void>;
  onDelete?: (entry: MoodEntry) => Promise<void>;
  className?: string;
}

export default function MoodEntryDetail({
  entry,
  onClose,
  onUpdate,
  onDelete,
  className
}: MoodEntryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editedNotes, setEditedNotes] = useState(entry.notes || '');
  const [editedActivities, setEditedActivities] = useState(entry.activities || []);
  const [editedTags, setEditedTags] = useState(entry.tags || []);
  const [customActivity, setCustomActivity] = useState('');
  const [customTag, setCustomTag] = useState('');
  
  const moodData = MOOD_DATA[entry.mood_level];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handler for activities
  const toggleActivity = (activity: string) => {
    if (editedActivities.includes(activity)) {
      setEditedActivities(editedActivities.filter(a => a !== activity));
    } else {
      setEditedActivities([...editedActivities, activity]);
    }
  };

  // Handler for adding custom activity
  const addCustomActivity = () => {
    if (customActivity.trim() && !editedActivities.includes(customActivity.trim())) {
      setEditedActivities([...editedActivities, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  // Handler for tags
  const toggleTag = (tag: string) => {
    if (editedTags.includes(tag)) {
      setEditedTags(editedTags.filter(t => t !== tag));
    } else {
      setEditedTags([...editedTags, tag]);
    }
  };

  // Handler for adding custom tag
  const addCustomTag = () => {
    if (customTag.trim() && !editedTags.includes(customTag.trim())) {
      setEditedTags([...editedTags, customTag.trim()]);
      setCustomTag('');
    }
  };
  
  // Handle update
  const handleUpdate = async () => {
    if (!onUpdate) return;
    
    setIsLoading(true);
    
    try {
      await onUpdate({
        ...entry,
        notes: editedNotes,
        activities: editedActivities,
        tags: editedTags
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating mood entry:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsLoading(true);
    
    try {
      await onDelete(entry);
      onClose();
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      setIsDeleting(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={cn(
      "bg-background rounded-lg border border-foreground/10 shadow-lg overflow-hidden max-w-2xl w-full",
      className
    )}>
      {/* Header */}
      <div 
        className="p-6 relative flex items-center justify-between"
        style={{ backgroundColor: moodData.lightColor, color: moodData.color }}
      >
        <div className="flex items-center">
          <span className="text-3xl mr-4">{moodData.emoji}</span>
          <div>
            <h3 className="text-xl font-semibold">{moodData.name} Mood</h3>
            <p className="text-sm opacity-80">{formatDate(entry.created_at)}</p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          // Edit Form
          <div className="space-y-6">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2 text-foreground/80">
                Notes
              </label>
              <textarea
                id="notes"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-3 border border-foreground/10 rounded-lg bg-background/50 min-h-[120px] focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
            
            {/* Activities section */}
            <div>
              <h4 className="text-md font-medium mb-3 text-foreground/80">
                Activities
              </h4>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_ACTIVITIES.map((activity) => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-all",
                      editedActivities.includes(activity) 
                        ? `bg-primary text-white` 
                        : `bg-background border border-foreground/10 text-foreground/80 hover:bg-primary/10`
                    )}
                  >
                    {activity}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  placeholder="Add custom activity..."
                  className="flex-1 p-2 border border-foreground/10 rounded-lg bg-background/50 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomActivity();
                    }
                  }}
                />
                <button 
                  onClick={addCustomActivity}
                  disabled={!customActivity.trim()}
                  className="p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Tags/Emotions section */}
            <div>
              <h4 className="text-md font-medium mb-3 text-foreground/80">
                Emotions
              </h4>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => toggleTag(emotion)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-all",
                      editedTags.includes(emotion) 
                        ? `bg-primary text-white` 
                        : `bg-background border border-foreground/10 text-foreground/80 hover:bg-primary/10`
                    )}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom emotion..."
                  className="flex-1 p-2 border border-foreground/10 rounded-lg bg-background/50 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                />
                <button 
                  onClick={addCustomTag}
                  disabled={!customTag.trim()}
                  className="p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : isDeleting ? (
          // Delete Confirmation
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h4 className="text-lg font-medium text-foreground mb-2">Delete Mood Entry?</h4>
            <p className="text-foreground/70 mb-6 max-w-sm mx-auto">
              This will permanently delete this mood entry. This action cannot be undone.
            </p>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {entry.notes && (
              <div>
                <h4 className="text-md font-medium mb-3 text-foreground/80">Notes</h4>
                <div className="bg-foreground/5 p-4 rounded-lg text-foreground/80">
                  {entry.notes.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {entry.activities && entry.activities.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-3 text-foreground/80">Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.activities.map((activity, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {entry.tags && entry.tags.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-3 text-foreground/80">Emotions</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-foreground/10 text-foreground/80 rounded-lg text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {!entry.notes && (!entry.activities || entry.activities.length === 0) && (!entry.tags || entry.tags.length === 0) && (
              <div className="text-center py-6 text-foreground/60">
                <p>No additional details were recorded for this mood.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer/Actions */}
      <div className="p-4 border-t border-foreground/10 bg-foreground/5 flex justify-end space-x-3">
        {isEditing ? (
          // Edit Mode Actions
          <>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md text-foreground/70 hover:bg-foreground/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </>
        ) : isDeleting ? (
          // Delete Confirmation Actions
          <>
            <button
              onClick={() => setIsDeleting(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md text-foreground/70 hover:bg-foreground/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </>
        ) : (
          // View Mode Actions
          <>
            {onDelete && (
              <button
                onClick={() => setIsDeleting(true)}
                className="p-2 text-foreground/60 hover:text-red-500 transition-colors rounded-full"
                title="Delete entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-md flex items-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Entry</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 