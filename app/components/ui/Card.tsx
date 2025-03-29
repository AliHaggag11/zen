import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-background rounded-lg shadow-md border border-primary/10 ${className}`}>
      {children}
    </div>
  );
} 