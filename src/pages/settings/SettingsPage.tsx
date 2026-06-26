import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSave, FiUser, FiBriefcase, FiLock, FiSun, FiMoon } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth, useTheme } from '../../context';
import { Card, Button, Input, PageHeader } from '../../components/ui';
import { authService } from '../../services';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
});

const companySchema = z.object({
  name: z.string().min(1, 'Company name required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().optional(),
  country: z.string().default('Pakistan'),
  postalCode: z.string().optional(),
  phone: z.string().min(10, 'Phone required'),
  email: z.string().email('Valid email required'),
  website: z.string().url().optional().or(z.literal('')),
  ntn: z.string().optional(),
  stn: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type CompanyForm = z.infer<typeof companySchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923082434421';

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: user?.company?.name || '',
      address: user?.company?.address || '',
      city: user?.company?.city || '',
      state: user?.company?.state || '',
      country: user?.company?.country || 'Pakistan',
      postalCode: user?.company?.postalCode || '',
      phone: user?.company?.phone || '',
      email: user?.company?.email || user?.email || '',
      website: user?.company?.website || '',
      ntn: user?.company?.ntn || '',
      stn: user?.company?.stn || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await updateProfile(data as Parameters<typeof updateProfile>[0]);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onCompanySubmit = async (data: CompanyForm) => {
    setLoading(true);
    try {
      await updateProfile({ company: data } as Parameters<typeof updateProfile>[0]);
      toast.success('Company info updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed');
      passwordForm.reset();
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'company', label: 'Company', icon: FiBriefcase },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? FiMoon : FiSun },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account settings" />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 flex-shrink-0">
          <Card padding="sm" className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold mb-6 text-secondary-900 dark:text-secondary-100">
                Profile Information
              </h2>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                <Input label="Full Name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
                <Input label="Phone Number" error={profileForm.formState.errors.phone?.message} {...profileForm.register('phone')} />
                <div className="pt-4">
                  <Button type="submit" loading={loading} icon={<FiSave className="w-4 h-4" />}>Save Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'company' && (
            <Card>
              <h2 className="text-lg font-semibold mb-6 text-secondary-900 dark:text-secondary-100">Company Information</h2>
              <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Company Name" error={companyForm.formState.errors.name?.message} {...companyForm.register('name')} />
                  <Input label="Phone" error={companyForm.formState.errors.phone?.message} {...companyForm.register('phone')} />
                  <Input label="Email" type="email" error={companyForm.formState.errors.email?.message} {...companyForm.register('email')} />
                  <Input label="Website" placeholder="https://" error={companyForm.formState.errors.website?.message} {...companyForm.register('website')} />
                  <Input label="NTN" {...companyForm.register('ntn')} />
                  <Input label="STN" {...companyForm.register('stn')} />
                </div>
                <Input label="Address" error={companyForm.formState.errors.address?.message} {...companyForm.register('address')} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="City" error={companyForm.formState.errors.city?.message} {...companyForm.register('city')} />
                  <Input label="State/Province" {...companyForm.register('state')} />
                  <Input label="Postal Code" {...companyForm.register('postalCode')} />
                </div>
                <div className="pt-4">
                  <Button type="submit" loading={loading} icon={<FiSave className="w-4 h-4" />}>Save Company Info</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold mb-6 text-secondary-900 dark:text-secondary-100">Change Password</h2>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <Input label="Current Password" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
                <Input label="New Password" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
                <Input label="Confirm New Password" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
                <div className="pt-4">
                  <Button type="submit" loading={loading} icon={<FiLock className="w-4 h-4" />}>Update Password</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <h2 className="text-lg font-semibold mb-6 text-secondary-900 dark:text-secondary-100">Appearance Settings</h2>
              <div className="space-y-4">
                <p className="text-secondary-600 dark:text-secondary-400">Choose your preferred theme:</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                    }`}
                  >
                    <FiSun className="w-8 h-8 mx-auto mb-2 text-warning-500" />
                    <p className="font-medium">Light</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                    }`}
                  >
                    <FiMoon className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                    <p className="font-medium">Dark</p>
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card className="mt-6">
        <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-4">Need Help?</h3>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <FaWhatsapp className="w-5 h-5" />
          Contact Support on WhatsApp
        </a>
      </Card>
    </div>
  );
};

export default SettingsPage;
