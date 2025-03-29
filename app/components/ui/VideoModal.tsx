'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Debug logs
  useEffect(() => {
    console.log('VideoModal props:', { isOpen, videoUrl, title });
  }, [isOpen, videoUrl, title]);

  // Close modal when clicking outside content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        console.log('Clicked outside modal, closing');
        onClose();
      }
    };

    if (isOpen) {
      console.log('Adding click outside listener');
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('Escape key pressed, closing modal');
        onClose();
      }
    };

    if (isOpen) {
      console.log('Adding escape key listener');
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-background rounded-lg overflow-hidden w-full max-w-4xl shadow-xl"
          >
            <div className="flex justify-between items-center bg-primary/5 p-4 border-b border-primary/10">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <button 
                onClick={() => {
                  console.log('Close button clicked');
                  onClose();
                }}
                className="p-1 hover:bg-primary/10 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video relative bg-black rounded-md overflow-hidden">
                <div className="w-full h-full">
                  <iframe 
                    src={`${videoUrl}?autoplay=1&rel=0`} 
                    className="absolute top-0 left-0 w-full h-full"
                    title={title}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    frameBorder="0"
                  ></iframe>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 