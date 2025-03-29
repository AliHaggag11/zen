'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type MoodTheme = 'serene' | 'joyful' | 'reflective' | 'vibrant' | 'balanced';

interface ThemeContextType {
  currentTheme: MoodTheme;
  setTheme: (theme: MoodTheme) => void;
  setThemeBasedOnMood: (moodLevel: number) => void;
  setMood: (mood: MoodTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>('balanced');

  // Map mood levels (1-5) to theme types
  const setThemeBasedOnMood = (moodLevel: number) => {
    switch (moodLevel) {
      case 1: // Very Low
        setCurrentTheme('reflective');
        break;
      case 2: // Low
        setCurrentTheme('serene');
        break;
      case 3: // Neutral
        setCurrentTheme('balanced');
        break;
      case 4: // Good
        setCurrentTheme('joyful');
        break;
      case 5: // Excellent
        setCurrentTheme('vibrant');
        break;
      default:
        setCurrentTheme('balanced');
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
      serene: {
        background: '#edf6fc',
        foreground: '#2c4356',
        primary: '#62a7db',
        secondary: '#c7e2f5',
        accent: '#3a89c9'
      },
      joyful: {
        background: '#fff8ed',
        foreground: '#553d2c',
        primary: '#ffb347',
        secondary: '#ffe7c1',
        accent: '#ffa126'
      },
      reflective: {
        background: '#f5f5fa',
        foreground: '#2a2c3d',
        primary: '#7b8cde',
        secondary: '#dce0f9',
        accent: '#5c6bc0'
      },
      vibrant: {
        background: '#fef4f8',
        foreground: '#4d2d3c',
        primary: '#f56fa1',
        secondary: '#fcdaeb',
        accent: '#ec407a'
      },
      balanced: {
        background: '#f9fefe',
        foreground: '#1a3b39',
        primary: '#26a69a',
        secondary: '#e0f2f1',
        accent: '#00897b'
      }
    };

    const selectedTheme = themes[theme];

    // Apply theme variables to root
    root.style.setProperty('--background', selectedTheme.background);
    root.style.setProperty('--foreground', selectedTheme.foreground);
    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--secondary', selectedTheme.secondary);
    root.style.setProperty('--accent', selectedTheme.accent);
    
    // Map the new theme names to old ones for backward compatibility
    const classMapping: Record<MoodTheme, string> = {
      serene: 'calm',
      joyful: 'happy',
      reflective: 'sad',
      vibrant: 'energetic',
      balanced: 'neutral'
    };
    
    // Also add the theme class for additional CSS
    root.classList.remove('theme-calm', 'theme-happy', 'theme-sad', 'theme-energetic', 'theme-neutral');
    root.classList.add(`theme-${classMapping[theme]}`);
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