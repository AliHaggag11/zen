'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/lib/themeContext';

interface MoodOption {
  value: number;
  label: string;
  emoji: string;
  description: string;
}

interface MoodTrackerProps {
  className?: string;
  onMoodSelected?: (moodValue: number) => void;
}

export default function MoodTracker({ className, onMoodSelected }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);
  const { setThemeBasedOnMood } = useTheme();

  const moodOptions: MoodOption[] = [
    { value: 1, label: 'Very Sad', emoji: '😢', description: 'Feeling down or upset' },
    { value: 2, label: 'Sad', emoji: '😔', description: 'Not in the best mood' },
    { value: 3, label: 'Neutral', emoji: '😐', description: 'Neither happy nor sad' },
    { value: 4, label: 'Happy', emoji: '😊', description: 'Feeling good today' },
    { value: 5, label: 'Very Happy', emoji: '😁', description: 'Feeling great!' },
  ];

  const handleMoodSelect = (moodValue: number) => {
    setSelectedMood(moodValue);
    setThemeBasedOnMood(moodValue);
    
    if (onMoodSelected) {
      onMoodSelected(moodValue);
    }
  };

  return (
    <div className={cn('bg-background rounded-lg shadow-md p-8 border border-primary/10', className)}>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">How are you feeling today?</h3>
        <p className="text-foreground/70">Select your mood to personalize your experience</p>
      </div>

      <div className="flex flex-col items-stretch space-y-3">
        {moodOptions.map((mood) => {
          // Determine if this mood is selected or hovered
          const isSelected = selectedMood === mood.value;
          const isHovered = hoveredMood === mood.value;
          
          // Create dynamic styles based on the mood value
          const getMoodColor = (value: number) => {
            switch (value) {
              case 1: return 'from-blue-500/20 to-indigo-500/20 border-blue-200 hover:bg-blue-50';
              case 2: return 'from-indigo-500/20 to-purple-500/20 border-indigo-200 hover:bg-indigo-50';
              case 3: return 'from-purple-500/20 to-violet-500/20 border-purple-200 hover:bg-purple-50';
              case 4: return 'from-amber-500/20 to-orange-500/20 border-amber-200 hover:bg-amber-50';
              case 5: return 'from-orange-500/20 to-red-500/20 border-orange-200 hover:bg-orange-50';
              default: return 'from-gray-200 to-gray-100 border-gray-200 hover:bg-gray-50';
            }
          };

          return (
            <motion.button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              onMouseEnter={() => setHoveredMood(mood.value)}
              onMouseLeave={() => setHoveredMood(null)}
              className={cn(
                'relative flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r border',
                isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50',
                getMoodColor(mood.value)
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 text-2xl mr-4">{mood.emoji}</div>
                <div className="flex-grow">
                  <div className="font-medium">{mood.label}</div>
                  <div className="text-sm text-foreground/70">{mood.description}</div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Visual feedback for the mood - progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    mood.value === 1 ? "bg-blue-500" : 
                    mood.value === 2 ? "bg-indigo-500" :
                    mood.value === 3 ? "bg-purple-500" :
                    mood.value === 4 ? "bg-amber-500" :
                    "bg-orange-500"
                  )}
                  style={{ width: `${(mood.value / 5) * 100}%` }}
                ></div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedMood !== null && (
        <div className="mt-6 pt-4 border-t border-foreground/10">
          <h4 className="font-medium text-foreground mb-2">Your selected mood: {moodOptions.find(m => m.value === selectedMood)?.label}</h4>
          <p className="text-sm text-foreground/70">
            {selectedMood <= 2 
              ? "We've adjusted your experience to provide a calming environment. Take care of yourself today." 
              : selectedMood === 3 
                ? "Our neutral theme provides a balanced experience while you navigate the app." 
                : "We've brightened things up to match your positive mood. Enjoy your experience!"}
          </p>
        </div>
      )}
    </div>
  );
} 