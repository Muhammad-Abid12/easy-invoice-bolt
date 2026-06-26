import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSave, FiSettings, FiCalendar, FiFileText, FiPhone } from 'react-icons/fi';
import { adminService } from '../../services';
import { SystemSettings } from '../../types';
import { Card, Button, Input, PageHeader, Select, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  trialDays: z.number().min(1).max(365),
  freeInvoiceLimit: z.number().min(1).max(1000),
  whatsappNumber: z.string().min(10),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await adminService.getSettings();
      reset(settings);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true);
    try {
      await adminService.updateSettings(data);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Configure application settings" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Trial Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Trial Settings</h3>
              <p className="text-sm text-secondary-500">Configure the free trial period</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Trial Duration (Days)"
              type="number"
              error={errors.trialDays?.message}
              {...register('trialDays', { valueAsNumber: true })}
            />
            <Input
              label="Free Invoice Limit"
              type="number"
              error={errors.freeInvoiceLimit?.message}
              {...register('freeInvoiceLimit', { valueAsNumber: true })}
            />
          </div>

          <p className="text-sm text-secondary-500 mt-4">
            New users will get {30} days of free trial OR up to {10} free invoices, whichever comes first.
          </p>
        </Card>

        {/* Contact Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <FiPhone className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Support Contact</h3>
              <p className="text-sm text-secondary-500">WhatsApp support number</p>
            </div>
          </div>

          <Input
            label="WhatsApp Number"
            placeholder="923001234567"
            icon={<span className="text-secondary-400">+ </span>}
            error={errors.whatsappNumber?.message}
            {...register('whatsappNumber')}
          />
        </Card>

        {/* System Controls */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">System Controls</h3>
              <p className="text-sm text-secondary-500">Manage system-wide features</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-100">Allow Registration</p>
                <p className="text-sm text-secondary-500">New users can create accounts</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-primary-600 rounded"
                {...register('allowRegistration')}
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-100">Maintenance Mode</p>
                <p className="text-sm text-secondary-500">Disable application for all users</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-error-600 rounded"
                {...register('maintenanceMode')}
              />
            </label>
          </div>
        </Card>

        {/* Payment Module */}
        <Card className="bg-secondary-50 dark:bg-secondary-800 border-dashed">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="warning">Coming Soon</Badge>
          </div>
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Payment Integration</h3>
          <p className="text-sm text-secondary-500">
            Payment gateway integration, subscription plans, and invoice payments will be available in a future update.
          </p>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon={<FiSave className="w-4 h-4" />}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
