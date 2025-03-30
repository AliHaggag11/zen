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
      className="border border-gray-200 rounded-lg p-5 bg-white hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
      onClick={handleClick}
    >
      <h4 className="font-medium mb-3">{title}</h4>
      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3 relative group overflow-hidden">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-sm text-foreground/70">{description}</p>
    </div>
  );
} 