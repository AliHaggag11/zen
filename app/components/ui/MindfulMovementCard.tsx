'use client';

import React from 'react';

interface MindfulMovementCardProps {
  title: string;
  description: string;
  videoUrl: string;
  videoTitle: string;
  onVideoClick: (url: string, title: string) => void;
}

export default function MindfulMovementCard({ 
  title, 
  description, 
  videoUrl, 
  videoTitle,
  onVideoClick 
}: MindfulMovementCardProps) {
  
  const handleClick = () => {
    console.log(`Clicked on ${title} card with video URL: ${videoUrl}`);
    onVideoClick(videoUrl, videoTitle);
  };
  
  return (
    <div 
      className="border border-primary/10 rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <h4 className="font-medium mb-2 text-center">{title}</h4>
      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3 relative group">
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <p className="text-sm text-foreground/70">{description}</p>
    </div>
  );
} 