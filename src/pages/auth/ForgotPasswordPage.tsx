import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/auth/forgot-password`, { email: data.email });
      setSubmitted(true);
      toast.success('Reset instructions sent to your email');
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923082434421';

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Check Your Email
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-8">
          We've sent password reset instructions to your email address. Please check your inbox.
        </p>
        <Link to="/login">
          <Button variant="secondary" icon={<FiArrowLeft className="w-4 h-4" />}>
            Back to Login
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100">
          Forgot Password?
        </h2>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Enter your email and we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<FiMail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="mt-8 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
        <p className="text-sm text-secondary-600 dark:text-secondary-400 text-center mb-3">
          Need Help?
        </p>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <FaWhatsapp className="w-5 h-5" />
          Contact on WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
