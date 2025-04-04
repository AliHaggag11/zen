import React from 'react';
import Card from '../../components/ui/Card';
import { cn } from '@/app/lib/utils';

interface JournalEntryProps {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  tags?: string[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function JournalEntry({
  id,
  title,
  content,
  createdAt,
  mood,
  tags,
  onEdit,
  onDelete
}: JournalEntryProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getMoodColor = (mood?: string) => {
    if (!mood) return { bg: 'bg-primary/80', pill: 'bg-primary/10 text-primary' };
    
    const lowerMood = mood.toLowerCase();
    
    if (lowerMood.includes('reflective') || lowerMood.includes('sad')) {
      return { 
        bg: 'bg-[#7b8cde]', 
        pill: 'bg-[#dce0f9] text-[#5c6bc0]',
        emoji: '🤔'
      };
    }
    
    if (lowerMood.includes('serene') || lowerMood.includes('calm')) {
      return { 
        bg: 'bg-[#62a7db]', 
        pill: 'bg-[#c7e2f5] text-[#3a89c9]',
        emoji: '😌'
      };
    }
    
    if (lowerMood.includes('balanced') || lowerMood.includes('neutral')) {
      return { 
        bg: 'bg-[#26a69a]', 
        pill: 'bg-[#e0f2f1] text-[#00897b]',
        emoji: '😊'
      };
    }
    
    if (lowerMood.includes('joyful') || lowerMood.includes('happy')) {
      return { 
        bg: 'bg-[#ffb347]', 
        pill: 'bg-[#ffe7c1] text-[#ffa126]',
        emoji: '😄'
      };
    }
    
    if (lowerMood.includes('vibrant') || lowerMood.includes('energetic')) {
      return { 
        bg: 'bg-[#f56fa1]', 
        pill: 'bg-[#fcdaeb] text-[#ec407a]',
        emoji: '🤩'
      };
    }
    
    return { bg: 'bg-primary/80', pill: 'bg-primary/10 text-primary' };
  };
  
  const moodColors = getMoodColor(mood);
  
  return (
    <Card className="mb-6 p-0 overflow-hidden">
      <div className="relative">
        {/* Colored top bar, customized based on mood */}
        <div className={cn("absolute top-0 left-0 w-full h-1", moodColors.bg)}></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {mood && (
              <span className={cn("text-xs px-2 py-1 rounded-full flex items-center", moodColors.pill)}>
                {moodColors.emoji && <span className="mr-1">{moodColors.emoji}</span>}
                {mood}
              </span>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none mb-4 text-foreground/80">
            {content.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-2">{paragraph}</p>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-foreground/60">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(createdAt)}</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="p-2 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                title="Edit entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {tags && tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-foreground/10">
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, i) => (
                  <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 