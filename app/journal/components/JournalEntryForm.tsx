import React from 'react';
import Card from '../../components/ui/Card';
import { motion } from 'framer-motion';

interface JournalEntryFormProps {
  title: string;
  content: string;
  mood: string;
  tags: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onMoodChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isEdit?: boolean;
  isSaving?: boolean;
}

export default function JournalEntryForm({
  title,
  content,
  mood,
  tags,
  onTitleChange,
  onContentChange,
  onMoodChange,
  onTagsChange,
  onSubmit,
  onCancel,
  isEdit = false,
  isSaving = false
}: JournalEntryFormProps) {
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="flex justify-between items-center bg-primary/5 p-4 border-b border-primary/10">
        <h2 className="text-xl font-semibold text-foreground">{isEdit ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-1 hover:bg-primary/10 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1 text-foreground/70">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-background"
            placeholder="Give your entry a title"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1 text-foreground/70">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-background min-h-[200px]"
            placeholder="What's on your mind today?"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mood" className="block text-sm font-medium mb-1 text-foreground/70">Mood (optional)</label>
            <input
              type="text"
              id="mood"
              value={mood}
              onChange={(e) => onMoodChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-background"
              placeholder="How are you feeling?"
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1 text-foreground/70">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => onTagsChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-background"
              placeholder="gratitude, work, family"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </Card>
  );
} 