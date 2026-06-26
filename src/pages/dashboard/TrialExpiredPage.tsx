import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiRefreshCw } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../context';

const TrialExpiredPage: React.FC = () => {
  const { user } = useAuth();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923082434421';

  const reasons = [
    user?.trialEndDate && new Date(user.trialEndDate) <= new Date()
      ? 'Your 30-day free trial has expired'
      : null,
    user?.invoiceCount >= user?.maxInvoices
      ? 'You have reached the maximum of 10 free invoices'
      : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary-50 dark:bg-secondary-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="text-center p-8">
          <div className="w-20 h-20 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLock className="w-10 h-10 text-error-600 dark:text-error-400" />
          </div>

          <h1 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Trial Expired
          </h1>

          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Your account has been locked due to the following reason(s):
          </p>

          <ul className="text-left space-y-2 mb-6">
            {reasons.map((reason, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400"
              >
                <span className="w-5 h-5 rounded-full bg-error-100 dark:bg-error-900/30 text-error-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  !
                </span>
                {reason}
              </li>
            ))}
          </ul>

          <div className="space-y-3 mb-8">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              To continue using Easy Invoice Manager and unlock all features:
            </p>
            <ul className="text-sm text-secondary-600 dark:text-secondary-400 text-left space-y-1">
              <li>- Generate unlimited invoices</li>
              <li>- Export and print PDF invoices</li>
              <li>- Manage unlimited customers</li>
              <li>- Access premium features</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              icon={<FaWhatsapp className="w-5 h-5" />}
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
              className="bg-green-500 hover:bg-green-600"
            >
              Contact Support on WhatsApp
            </Button>

            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              or email us at{' '}
              <a href="mailto:support@easyinvoice.pk" className="text-primary-600 dark:text-primary-400">
                support@easyinvoice.pk
              </a>
            </p>
          </div>
        </Card>

        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-6">
          Your data is safe and will be preserved. Upgrade to continue.
        </p>
      </motion.div>
    </div>
  );
};

export default TrialExpiredPage;
