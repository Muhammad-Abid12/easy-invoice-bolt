import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const colorClasses = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  error: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}) => {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-soft border border-secondary-100 dark:border-secondary-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-2 text-sm font-medium ${
                trend.isPositive ? 'text-success-600' : 'text-error-600'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}> = ({ title, subtitle, action, breadcrumb }) => {
  return (
    <div className="mb-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-secondary-400">/</span>}
                {item.href ? (
                  <a href={item.href} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-secondary-500 dark:text-secondary-400">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
};
