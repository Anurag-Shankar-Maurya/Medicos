import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className={`animate-spin text-primary-600 ${sizeClasses[size]}`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center">
    <Spinner size="lg" />
    <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading data...</p>
  </div>
);