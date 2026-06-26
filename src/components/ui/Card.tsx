import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -4, scale: 1.01 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={`
        bg-white dark:bg-secondary-800 rounded-xl shadow-soft
        border border-secondary-100 dark:border-secondary-700
        overflow-hidden
        ${hover ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`border-b border-secondary-100 dark:border-secondary-700 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-secondary-900 dark:text-secondary-100 ${className}`}>
    {children}
  </h3>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`border-t border-secondary-100 dark:border-secondary-700 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);
