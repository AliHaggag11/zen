// Define mood types and interfaces for the application

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type MoodName = 'Reflective' | 'Serene' | 'Balanced' | 'Joyful' | 'Vibrant';
export type MoodThemeName = 'reflective' | 'serene' | 'balanced' | 'joyful' | 'vibrant';

export interface MoodData {
  level: MoodLevel;
  name: MoodName;
  emoji: string;
  description: string;
  themeName: MoodThemeName;
  color: string;
  lightColor: string;
}

export interface MoodEntry {
  id?: string;
  created_at: string;
  user_id: string;
  mood_level: MoodLevel;
  notes?: string;
  tags?: string[];
  activities?: string[];
}

export const MOOD_DATA: Record<MoodLevel, MoodData> = {
  1: {
    level: 1,
    name: 'Reflective',
    emoji: '🤔',
    description: 'Processing emotions and thoughts',
    themeName: 'reflective',
    color: '#7b8cde',
    lightColor: '#dce0f9'
  },
  2: {
    level: 2,
    name: 'Serene',
    emoji: '😌',
    description: 'Peaceful and tranquil',
    themeName: 'serene',
    color: '#62a7db',
    lightColor: '#c7e2f5'
  },
  3: {
    level: 3,
    name: 'Balanced',
    emoji: '😊',
    description: 'Centered and content',
    themeName: 'balanced',
    color: '#26a69a',
    lightColor: '#e0f2f1'
  },
  4: {
    level: 4,
    name: 'Joyful',
    emoji: '😄',
    description: 'Happy and uplifted',
    themeName: 'joyful',
    color: '#ffb347',
    lightColor: '#ffe7c1'
  },
  5: {
    level: 5,
    name: 'Vibrant',
    emoji: '🤩',
    description: 'Energized and excited',
    themeName: 'vibrant',
    color: '#f56fa1',
    lightColor: '#fcdaeb'
  }
};

export const COMMON_ACTIVITIES = [
  'Exercise',
  'Meditation',
  'Reading',
  'Socializing',
  'Working',
  'Learning',
  'Creating',
  'Resting',
  'Nature',
  'Family time',
  'Self-care',
  'Journaling'
];

export const COMMON_EMOTIONS = [
  'Grateful',
  'Anxious',
  'Focused',
  'Stressed',
  'Inspired',
  'Tired',
  'Hopeful',
  'Overwhelmed',
  'Relaxed',
  'Frustrated', 
  'Motivated',
  'Vulnerable'
]; 