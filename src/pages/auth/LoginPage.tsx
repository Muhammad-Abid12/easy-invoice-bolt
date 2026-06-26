import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    clearError();
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923082434421';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="lg:hidden flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mx-auto mb-4">
          <span className="text-3xl font-bold text-white">E</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100">
          Welcome Back
        </h2>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Sign in to manage your invoices
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

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon={<FiLock className="w-5 h-5" />}
          error={errors.password?.message}
          iconPosition="left"
          {...register('password', {
            onChange: () => clearError?.(),
          })}
          {...({
            rightIcon: (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            ),
          } as unknown as InputProps)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
            <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Forgot password?
          </Link>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200 dark:border-secondary-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-secondary-900 text-secondary-500">New here?</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Create an account
          </Link>
        </div>
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

export default LoginPage;
