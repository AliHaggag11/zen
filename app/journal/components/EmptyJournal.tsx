import React from 'react';
import Card from '../../components/ui/Card';

interface EmptyJournalProps {
  onCreateFirst: () => void;
}

export default function EmptyJournal({ onCreateFirst }: EmptyJournalProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-primary"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-foreground">No Journal Entries Yet</h2>
        <p className="text-foreground/70 mb-6 max-w-md mx-auto">
          Start journaling to track your thoughts and feelings over time. Regular journaling can help improve mental clarity and emotional well-being.
        </p>
        
        <button 
          onClick={onCreateFirst}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Your First Entry
        </button>
      </div>
    </Card>
  );
} 