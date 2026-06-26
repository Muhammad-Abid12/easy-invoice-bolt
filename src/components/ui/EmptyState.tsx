import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage } from 'react-icons/fi';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FiPackage className="w-12 h-12" />,
  title,
  description,
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="text-secondary-400 dark:text-secondary-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
};
