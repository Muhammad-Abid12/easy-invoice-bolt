import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  return (
    <div
      className={`animate-pulse bg-secondary-200 dark:bg-secondary-700 ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 3 }) => {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-soft border border-secondary-100 dark:border-secondary-700">
      <Skeleton className="h-6 w-3/4 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 w-full ${i < lines - 1 ? 'mb-2' : ''}`} />
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-3 border-b border-secondary-200 dark:border-secondary-700">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};
