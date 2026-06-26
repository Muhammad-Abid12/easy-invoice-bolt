import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  className = '',
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 border
        ${selected
          ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
          : 'bg-white text-secondary-600 border-secondary-200 hover:bg-secondary-50 dark:bg-secondary-800 dark:text-secondary-300 dark:border-secondary-700 dark:hover:bg-secondary-700'
        }
        ${className}
      `}
    >
      {selected && <FiCheck className="w-3 h-3" />}
      {icon}
      {label}
    </motion.button>
  );
};
