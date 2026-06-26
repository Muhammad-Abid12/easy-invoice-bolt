import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import WhatsAppButton from './WhatsAppButton';

const AuthLayout: React.FC = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923082434421';

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-900 dark:to-secondary-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-center"
          >
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-8">
              <span className="text-4xl font-bold">E</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Easy Invoice Manager
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Professional invoice management for Pakistani businesses.
              Generate invoices, track payments, and manage your customers - all in one place.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-secondary-900">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default AuthLayout;
