import { useTheme } from '../../lib/themeContext';

interface ThemeButtonProps {
  mood?: 'calm' | 'happy' | 'sad' | 'energetic' | 'neutral';
  className?: string;
}

export function ThemeButton({ mood, className = '' }: ThemeButtonProps) {
  const { currentTheme, setMood } = useTheme();
  
  const handleClick = () => {
    if (mood) {
      setMood(mood);
    } else {
      // If no mood is specified, cycle through themes
      const themes = ['calm', 'happy', 'sad', 'energetic', 'neutral'] as const;
      const currentIndex = themes.indexOf(currentTheme as any);
      const nextIndex = (currentIndex + 1) % themes.length;
      setMood(themes[nextIndex]);
    }
  };
  
  // Get theme colors based on mood
  const getThemeColors = (themeMood: string) => {
    switch (themeMood) {
      case 'calm':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-200',
          active: 'bg-blue-500 text-white'
        };
      case 'happy':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          active: 'bg-yellow-500 text-white'
        };
      case 'sad':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          active: 'bg-indigo-500 text-white'
        };
      case 'energetic':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          border: 'border-red-200',
          active: 'bg-red-500 text-white'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200',
          active: 'bg-gray-500 text-white'
        };
    }
  };
  
  const colors = getThemeColors(mood || 'neutral');
  const isActive = mood ? currentTheme === mood : false;
  
  // If it's the main theme switcher without specific mood
  if (!mood) {
    return (
      <button 
        onClick={handleClick}
        className={`px-4 py-2 rounded-md border ${className} ${
          getThemeColors(currentTheme as string).border
        } hover:opacity-80 transition-colors flex items-center space-x-2`}
      >
        <span className="w-4 h-4 rounded-full bg-primary"></span>
        <span className="capitalize">{currentTheme} Theme</span>
      </button>
    );
  }
  
  // If it's a mood-specific button
  return (
    <button 
      onClick={handleClick}
      className={`px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-center transition-colors ${
        isActive ? colors.active : `${colors.bg} ${colors.text} ${colors.border}`
      } hover:opacity-90 ${className}`}
    >
      <span className="capitalize">{mood}</span>
    </button>
  );
} 