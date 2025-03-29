import React from 'react';
import { motion } from 'framer-motion';

interface JournalPageProps {
  children: React.ReactNode;
  className?: string;
}

export default function JournalPage({ children, className = '' }: JournalPageProps) {
  return (
    <motion.div 
      className={`relative bg-amber-50 dark:bg-slate-800 rounded-lg p-6 shadow-lg 
                  border-l border-r border-t border-b border-amber-200 dark:border-slate-700
                  overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 10px, rgba(0, 0, 0, 0.05) 0px 1px 5px, rgba(0, 0, 0, 0.1) 0px 0px 2px 1px inset'
      }}
    >
      {/* Binding effect */}
      <div className="absolute top-0 bottom-0 left-4 w-4 bg-amber-200/50 dark:bg-slate-700/50" style={{ 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 2px, transparent 2px)',
        backgroundSize: '100% 15px'
      }}></div>
      
      {/* Page fold effect */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-amber-100 to-transparent dark:from-slate-700 dark:to-transparent"></div>
      
      <div className="ml-6 relative">
        {children}
      </div>
    </motion.div>
  );
} 