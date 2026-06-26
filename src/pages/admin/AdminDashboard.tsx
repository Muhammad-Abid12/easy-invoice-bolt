import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiFileText, FiTrendingUp, FiClock, FiLock,
  FiDollarSign, FiCalendar, FiArrowRight
} from 'react-icons/fi';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { adminService } from '../../services';
import { Card, StatCard, PageHeader, Badge, Button } from '../../components/ui';
import { format, subDays } from 'date-fns';

interface AdminStats {
  totalCustomers: number;
  activeCustomers: number;
  lockedCustomers: number;
  trialUsers: number;
  expiredUsers: number;
  totalInvoices: number;
  todayInvoices: number;
  monthlyInvoices: number;
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const customerDistribution = stats
    ? [
        { name: 'Active', value: stats.activeCustomers },
        { name: 'Trial', value: stats.trialUsers },
        { name: 'Locked', value: stats.lockedCustomers },
        { name: 'Expired', value: stats.expiredUsers },
      ]
    : [];

  const revenueData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
    invoices: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 500000) + 50000,
  }));

  if (loading || !stats) {
    return <div className="animate-pulse space-y-6">{/* Skeleton */}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of Easy Invoice Manager"
        action={
          <Link to="/admin/customers">
            <Button variant="outline" icon={<FiUsers className="w-4 h-4" />}>
              Manage Customers
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<FiUsers className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Trial Users"
          value={stats.trialUsers}
          icon={<FiClock className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Locked Accounts"
          value={stats.lockedCustomers}
          icon={<FiLock className="w-6 h-6" />}
          color="error"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<FiFileText className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Today's Invoices"
          value={stats.todayInvoices}
          icon={<FiCalendar className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Monthly Invoices"
          value={stats.monthlyInvoices}
          icon={<FiFileText className="w-6 h-6" />}
          color="info"
        />
        <StatCard
          title="Expired Users"
          value={stats.expiredUsers}
          icon={<FiLock className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Revenue Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Invoice Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="invoices" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Customer Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Customer Distribution
          </h3>
          <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {customerDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-3">
            <Link
              to="/admin/customers"
              className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900 dark:text-secondary-100">
                    Manage Customers
                  </p>
                  <p className="text-sm text-secondary-500">View and manage all customers</p>
                </div>
              </div>
              <FiArrowRight className="w-5 h-5 text-secondary-400" />
            </Link>

            <Link
              to="/admin/invoices"
              className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900 dark:text-secondary-100">
                    Invoice Monitoring
                  </p>
                  <p className="text-sm text-secondary-500">View all generated invoices</p>
                </div>
              </div>
              <FiArrowRight className="w-5 h-5 text-secondary-400" />
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900 dark:text-secondary-100">
                    Reports
                  </p>
                  <p className="text-sm text-secondary-500">Generate and export reports</p>
                </div>
              </div>
              <FiArrowRight className="w-5 h-5 text-secondary-400" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                  <FiLock className="w-5 h-5 text-error-600 dark:text-error-400" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900 dark:text-secondary-100">
                    System Settings
                  </p>
                  <p className="text-sm text-secondary-500">Configure trial and system options</p>
                </div>
              </div>
              <FiArrowRight className="w-5 h-5 text-secondary-400" />
            </Link>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
