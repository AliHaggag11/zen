'use client';

import { useState, useEffect } from 'react';

interface AnimatedMessageProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function AnimatedMessage({ text, speed = 20, className = '' }: AnimatedMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className={`whitespace-pre-wrap text-sm sm:text-base ${className}`}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1" />
      )}
    </div>
  );
} 