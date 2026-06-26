import React, { forwardRef, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 text-sm bg-white dark:bg-secondary-800
            border rounded-lg focus:outline-none focus:ring-2
            focus:border-transparent transition-all duration-200
            placeholder:text-secondary-400 dark:placeholder:text-secondary-500
            resize-none
            ${error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-secondary-300 dark:border-secondary-600 focus:ring-primary-500'
            }
            dark:text-secondary-100
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error-600 dark:text-error-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-secondary-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
