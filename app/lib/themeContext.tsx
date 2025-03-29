'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type MoodTheme = 'calm' | 'happy' | 'sad' | 'energetic' | 'neutral';

interface ThemeContextType {
  currentTheme: MoodTheme;
  setTheme: (theme: MoodTheme) => void;
  setThemeBasedOnMood: (moodLevel: number) => void;
  setMood: (mood: MoodTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>('neutral');

  // Map mood levels (1-5) to theme types
  const setThemeBasedOnMood = (moodLevel: number) => {
    switch (moodLevel) {
      case 1: // Very Low
        setCurrentTheme('sad');
        break;
      case 2: // Low
        setCurrentTheme('calm');
        break;
      case 3: // Neutral
        setCurrentTheme('neutral');
        break;
      case 4: // Good
        setCurrentTheme('happy');
        break;
      case 5: // Excellent
        setCurrentTheme('energetic');
        break;
      default:
        setCurrentTheme('neutral');
    }
  };

  const setTheme = (theme: MoodTheme) => {
    setCurrentTheme(theme);
    // Set theme CSS variables on the document root
    applyTheme(theme);
  };
  
  // Direct mood setter (added for ThemeButton)
  const setMood = (mood: MoodTheme) => {
    setCurrentTheme(mood);
    applyTheme(mood);
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Apply theme to document root as CSS variables
  const applyTheme = (theme: MoodTheme) => {
    const root = document.documentElement;
    
    const themes = {
      calm: {
        background: '#e6f7ff',
        foreground: '#2c3e50',
        primary: '#4a90e2',
        secondary: '#b3d4fc',
        accent: '#81b0d5'
      },
      happy: {
        background: '#fff9e6',
        foreground: '#4a3f35',
        primary: '#ffc107',
        secondary: '#ffe082',
        accent: '#ffcd38'
      },
      sad: {
        background: '#f0f0f5',
        foreground: '#2d2d33',
        primary: '#6c757d',
        secondary: '#ced4da',
        accent: '#adb5bd'
      },
      energetic: {
        background: '#fff0f7',
        foreground: '#3d2635',
        primary: '#e83e8c',
        secondary: '#f8c8da',
        accent: '#f06595'
      },
      neutral: {
        background: '#ffffff',
        foreground: '#171717',
        primary: '#0D9488', // Teal color from the MoodTracker component
        secondary: '#E6FAF8',
        accent: '#14B8A6'
      }
    };

    const selectedTheme = themes[theme];

    // Apply theme variables to root
    root.style.setProperty('--background', selectedTheme.background);
    root.style.setProperty('--foreground', selectedTheme.foreground);
    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--secondary', selectedTheme.secondary);
    root.style.setProperty('--accent', selectedTheme.accent);
    
    // Also add the theme class for additional CSS
    root.classList.remove('theme-calm', 'theme-happy', 'theme-sad', 'theme-energetic', 'theme-neutral');
    root.classList.add(`theme-${theme}`);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, setThemeBasedOnMood, setMood }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 