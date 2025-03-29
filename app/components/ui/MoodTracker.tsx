'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/lib/themeContext';
import { MoodLevel, MOOD_DATA } from '@/app/lib/types';

interface MoodTrackerProps {
  className?: string;
  onMoodSelected?: (moodValue: MoodLevel) => void;
  selectedMood?: MoodLevel;
  hideDescription?: boolean;
}

export default function MoodTracker({ 
  className, 
  onMoodSelected,
  selectedMood: externalSelectedMood,
  hideDescription = false
}: MoodTrackerProps) {
  const [internalSelectedMood, setInternalSelectedMood] = useState<MoodLevel | null>(null);
  const [hoveredMood, setHoveredMood] = useState<MoodLevel | null>(null);
  const { setThemeBasedOnMood } = useTheme();

  // Use external selected mood if provided, otherwise use internal state
  const selectedMood = externalSelectedMood !== undefined ? externalSelectedMood : internalSelectedMood;

  const handleMoodSelect = (moodValue: MoodLevel) => {
    setInternalSelectedMood(moodValue);
    setThemeBasedOnMood(moodValue);
    
    if (onMoodSelected) {
      onMoodSelected(moodValue);
    }
  };

  // Create dynamic styles based on the mood value
  const getMoodColor = (value: MoodLevel) => {
    const mood = MOOD_DATA[value];
    return `from-[${mood.color}]/20 to-[${mood.color}]/20 border-[${mood.lightColor}] hover:bg-[${mood.lightColor}]/50`;
  };

  return (
    <div className={cn('bg-background rounded-lg border border-primary/10', className)}>
      <div className="flex flex-col items-stretch space-y-3">
        {Object.values(MOOD_DATA).map((mood) => {
          // Determine if this mood is selected or hovered
          const isSelected = selectedMood === mood.level;
          const isHovered = hoveredMood === mood.level;
          
          return (
            <motion.button
              key={mood.level}
              onClick={() => handleMoodSelect(mood.level)}
              onMouseEnter={() => setHoveredMood(mood.level)}
              onMouseLeave={() => setHoveredMood(null)}
              className={cn(
                'relative flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r border',
                isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50',
                `from-[${mood.color}]/20 to-[${mood.color}]/10 border-[${mood.lightColor}] hover:bg-[${mood.lightColor}]/50`
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 text-2xl mr-4">{mood.emoji}</div>
                <div className="flex-grow">
                  <div className="font-medium">{mood.name}</div>
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
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${(mood.level / 5) * 100}%`,
                    backgroundColor: mood.color
                  }}
                ></div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {!hideDescription && selectedMood !== null && (
        <div className="mt-6 pt-4 border-t border-foreground/10">
          <h4 className="font-medium text-foreground mb-2">Your selected mood: {MOOD_DATA[selectedMood].name}</h4>
          <p className="text-sm text-foreground/70">
            {selectedMood === 1 
              ? "We've adjusted your experience to a reflective environment. Take time to process your thoughts today." 
              : selectedMood === 2 
                ? "Our serene theme provides a peaceful atmosphere to help you find tranquility." 
                : selectedMood === 3 
                  ? "The balanced theme creates a harmonious experience as you use the app."
                  : selectedMood === 4
                    ? "We've brightened things up to match your joyful mood. Enjoy your experience!"
                    : "Our vibrant theme enhances your energetic state. Make the most of your momentum!"}
          </p>
        </div>
      )}
    </div>
  );
} 