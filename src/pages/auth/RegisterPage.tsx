import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiBriefcase } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        company: data.companyName ? {
          name: data.companyName,
          address: data.companyAddress || '',
          city: data.companyCity || '',
          state: '',
          country: 'Pakistan',
          postalCode: '',
          phone: data.phone || '',
          email: data.email,
        } : undefined,
      });
      toast.success('Account created! Enjoy your 30-day free trial.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
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
          Create Account
        </h2>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Get started with a 30-day free trial
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'}`}
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'}`}
          />
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<FiUser className="w-5 h-5" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<FiMail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number (Optional)"
              placeholder="+92 300 1234567"
              icon={<FiPhone className="w-5 h-5" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              icon={<FiLock className="w-5 h-5" />}
              iconPosition="left"
              error={errors.password?.message}
              {...register('password', { setValueAs: (v) => v })}
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              icon={<FiLock className="w-5 h-5" />}
              iconPosition="left"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', { setValueAs: (v) => v })}
            />

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center text-sm text-secondary-600 dark:text-secondary-400"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4 mr-2" /> : <FiEye className="w-4 h-4 mr-2" />}
                {showPassword ? 'Hide' : 'Show'} passwords
              </button>
            </div>

            <Button type="button" fullWidth onClick={() => setStep(2)}>
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Optional: Add your company details now, or you can add them later in settings.
              </p>
            </div>

            <Input
              label="Company Name (Optional)"
              placeholder="Your Business Name"
              icon={<FiBriefcase className="w-5 h-5" />}
              error={errors.companyName?.message}
              {...register('companyName', { setValueAs: (v) => v })}
            />

            <Input
              label="Company Address (Optional)"
              placeholder="Street address"
              error={errors.companyAddress?.message}
              {...register('companyAddress', { setValueAs: (v) => v })}
            />

            <Input
              label="City (Optional)"
              placeholder="Karachi"
              error={errors.companyCity?.message}
              {...register('companyCity', { setValueAs: (v) => v })}
            />

            <div className="flex gap-4">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Create Account
              </Button>
            </div>
          </motion.div>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            Sign in
          </Link>
        </p>
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

export default RegisterPage;
