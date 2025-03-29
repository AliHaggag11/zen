'use client';

import { useState, useEffect } from 'react';
import { MoodLevel, MOOD_DATA, COMMON_ACTIVITIES, COMMON_EMOTIONS } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';
import MoodTracker from './MoodTracker';
import { motion } from 'framer-motion';

interface MoodEntryFormProps {
  onSave: (entry: {
    mood_level: MoodLevel;
    notes: string;
    activities: string[];
    tags: string[];
  }) => Promise<void>;
  className?: string;
  isLoading?: boolean;
}

export default function MoodEntryForm({ 
  onSave, 
  className, 
  isLoading = false 
}: MoodEntryFormProps) {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [activities, setActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Handler for selecting mood
  const handleMoodSelected = (moodValue: MoodLevel) => {
    setSelectedMood(moodValue);
    setTimeout(() => {
      setStep(2);
    }, 500);
  };

  // Handler for activities
  const toggleActivity = (activity: string) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter(a => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

  // Handler for adding custom activity
  const addCustomActivity = () => {
    if (customActivity.trim() && !activities.includes(customActivity.trim())) {
      setActivities([...activities, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  // Handler for tags
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Handler for adding custom tag
  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  // Save the mood entry
  const handleSave = async () => {
    if (selectedMood) {
      await onSave({
        mood_level: selectedMood,
        notes,
        activities,
        tags
      });
      
      // Reset form
      setSelectedMood(null);
      setNotes('');
      setActivities([]);
      setTags([]);
      setStep(1);
    }
  };

  // Get current mood data
  const currentMood = selectedMood ? MOOD_DATA[selectedMood] : null;

  return (
    <div className={cn("bg-background rounded-lg shadow-md border border-primary/10", className)}>
      {/* Step 1: Select Mood */}
      {step === 1 && (
        <div className="p-8">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">How are you feeling today?</h3>
            <p className="text-foreground/70">Select your mood to personalize your experience</p>
          </div>
          
          <MoodTracker 
            onMoodSelected={handleMoodSelected}
            selectedMood={selectedMood as MoodLevel}
          />
        </div>
      )}
      
      {/* Step 2: Add Notes & Activities */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          <div className="mb-6">
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center text-primary hover:underline mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to mood selection
            </button>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">Tell us more about your {currentMood?.name.toLowerCase()} mood</h3>
            <p className="text-foreground/70">Add notes and activities to provide more context</p>
          </div>
          
          {/* Notes section */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium mb-2 text-foreground/80">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind today? How are you feeling? What contributed to your mood?"
              className="w-full p-3 border border-foreground/10 rounded-lg bg-background/50 min-h-[120px] focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
          </div>
          
          {/* Activities section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-foreground/80">
              What activities contributed to your mood today? (optional)
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_ACTIVITIES.map((activity) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm transition-all",
                    activities.includes(activity) 
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
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-foreground/80">
              What emotions are you experiencing? (optional)
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_EMOTIONS.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => toggleTag(emotion)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm transition-all",
                    tags.includes(emotion) 
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
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading || !selectedMood}
              className={cn(
                "px-6 py-3 rounded-lg bg-primary text-white font-medium text-sm flex items-center space-x-2 transition-all",
                "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Mood Entry</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 