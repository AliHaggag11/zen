import { useTheme } from '../../lib/themeContext';

interface ThemeButtonProps {
  mood?: 'serene' | 'joyful' | 'reflective' | 'vibrant' | 'balanced';
  className?: string;
}

export function ThemeButton({ mood, className = '' }: ThemeButtonProps) {
  const { currentTheme, setMood } = useTheme();
  
  const handleClick = () => {
    if (mood) {
      setMood(mood);
    } else {
      // If no mood is specified, cycle through themes
      const themes = ['serene', 'joyful', 'reflective', 'vibrant', 'balanced'] as const;
      const currentIndex = themes.indexOf(currentTheme as any);
      const nextIndex = (currentIndex + 1) % themes.length;
      setMood(themes[nextIndex]);
    }
  };
  
  // Get mood descriptions
  const getMoodDescription = (themeMood: string) => {
    switch (themeMood) {
      case 'serene': return 'Calm and peaceful';
      case 'joyful': return 'Bright and cheerful';
      case 'reflective': return 'Thoughtful and introspective';
      case 'vibrant': return 'Energetic and lively';
      case 'balanced': return 'Centered and focused';
      default: return '';
    }
  };
  
  // Get theme colors based on mood
  const getThemeColors = (themeMood: string) => {
    switch (themeMood) {
      case 'serene':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          hover: 'hover:bg-blue-100',
          active: 'bg-blue-500 text-white',
          icon: '💧'
        };
      case 'joyful':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200',
          hover: 'hover:bg-amber-100',
          active: 'bg-amber-500 text-white',
          icon: '☀️'
        };
      case 'reflective':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          hover: 'hover:bg-indigo-100',
          active: 'bg-indigo-500 text-white',
          icon: '🌙'
        };
      case 'vibrant':
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-600',
          border: 'border-pink-200',
          hover: 'hover:bg-pink-100',
          active: 'bg-pink-500 text-white',
          icon: '✨'
        };
      default: // balanced
        return {
          bg: 'bg-teal-50',
          text: 'text-teal-600',
          border: 'border-teal-200',
          hover: 'hover:bg-teal-100',
          active: 'bg-teal-500 text-white',
          icon: '🍃'
        };
    }
  };
  
  const colors = getThemeColors(mood || 'balanced');
  const isActive = mood ? currentTheme === mood : false;
  
  // If it's the main theme switcher without specific mood
  if (!mood) {
    return (
      <button 
        onClick={handleClick}
        className={`px-4 py-2 rounded-lg border shadow-sm ${className} ${
          getThemeColors(currentTheme as string).border
        } ${getThemeColors(currentTheme as string).bg} hover:opacity-90 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50`}
      >
        <span className="mr-2">{getThemeColors(currentTheme as string).icon}</span>
        <span className="capitalize font-medium">{currentTheme} Theme</span>
      </button>
    );
  }
  
  // If it's a mood-specific button
  return (
    <button 
      onClick={handleClick}
      title={getMoodDescription(mood)}
      className={`relative px-4 py-3 rounded-lg border shadow-sm text-sm font-medium flex flex-col items-center transition-all duration-300 ${
        isActive 
          ? `${colors.active} border-transparent transform scale-105` 
          : `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}`
      } hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 ${className}`}
    >
      {isActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
      )}
      <span className="text-lg mb-1">{colors.icon}</span>
      <span className="capitalize">{mood}</span>
    </button>
  );
} 