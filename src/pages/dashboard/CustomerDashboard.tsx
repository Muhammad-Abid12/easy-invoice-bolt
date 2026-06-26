import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiFileText, FiUsers, FiTrendingUp, FiClock, FiPercent,
  FiPlus, FiArrowRight, FiCalendar
} from 'react-icons/fi';
import { useAuth } from '../../context';
import { Card, StatCard, PageHeader, Badge, Button } from '../../components/ui';
import { invoiceService, customerService } from '../../services';
import { Invoice, Customer } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [salesData, setSalesData] = useState<{ date: string; sales: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [invoiceStats, invoicesResult, customersResult] = await Promise.all([
        invoiceService.getStats(),
        invoiceService.getAll({ limit: 5 }),
        customerService.getAll({ limit: 5 }),
      ]);

      setStats(invoiceStats);
      setRecentInvoices(invoicesResult.data);
      setTopCustomers(customersResult.data);

      // Generate sample sales data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        sales: Math.floor(Math.random() * 50000) + 10000,
      }));
      setSalesData(last7Days);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trialDaysRemaining = user?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(user.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const invoiceQuotaRemaining = user ? user.maxInvoices - user.invoiceCount : 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
        subtitle="Here's what's happening with your business today"
        action={
          <Link to="/invoices/new">
            <Button icon={<FiPlus className="w-4 h-4" />}>New Invoice</Button>
          </Link>
        }
      />

      {/* Trial Banner */}
      {user?.status !== 'locked' && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary-500 to-primary-600 border-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 text-white">
              <div>
                <h3 className="font-semibold text-lg">Free Trial Active</h3>
                <p className="text-white/80 text-sm mt-1">
                  You have <span className="font-bold">{trialDaysRemaining} days</span> and{' '}
                  <span className="font-bold">{invoiceQuotaRemaining} invoices</span> remaining in your trial.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="text-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <p className="text-2xl font-bold">{trialDaysRemaining}</p>
                  <p className="text-xs text-white/80">Days Left</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <p className="text-2xl font-bold">{invoiceQuotaRemaining}</p>
                  <p className="text-xs text-white/80">Invoices Left</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`PKR ${stats.todaySales.toLocaleString()}`}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Monthly Sales"
          value={`PKR ${stats.monthlySales.toLocaleString()}`}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<FiUsers className="w-6 h-6" />}
          color="info"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<FiFileText className="w-6 h-6" />}
          color="warning"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Sales Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Invoice Status
          </h3>
          <div className="space-y-4">
            <StatusRow
              label="Paid"
              count={stats.paidInvoices}
              total={stats.totalInvoices}
              color="bg-success-500"
            />
            <StatusRow
              label="Pending"
              count={stats.pendingInvoices}
              total={stats.totalInvoices}
              color="bg-warning-500"
            />
            <StatusRow
              label="Overdue"
              count={stats.totalInvoices - stats.paidInvoices - stats.pendingInvoices}
              total={stats.totalInvoices}
              color="bg-error-500"
            />
          </div>
          <div className="mt-6 pt-4 border-t border-secondary-100 dark:border-secondary-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats.paidInvoices}
                </p>
                <p className="text-sm text-secondary-500">Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning-600">{stats.pendingInvoices}</p>
                <p className="text-sm text-secondary-500">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-error-600">
                  {stats.totalInvoices - stats.paidInvoices - stats.pendingInvoices}
                </p>
                <p className="text-sm text-secondary-500">Overdue</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Invoices & Top Customers */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Recent Invoices
            </h3>
            <Link
              to="/invoices"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                No invoices yet. Create your first invoice!
              </p>
            ) : (
              recentInvoices.map((invoice) => (
                <Link
                  key={invoice._id}
                  to={`/invoices/${invoice._id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-secondary-100">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-secondary-500">{invoice.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary-900 dark:text-secondary-100">
                      PKR {invoice.total.toLocaleString()}
                    </p>
                    <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'error'}>
                      {invoice.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Top Customers
            </h3>
            <Link
              to="/customers"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {topCustomers.length === 0 ? (
              <p className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                No customers yet. Add your first customer!
              </p>
            ) : (
              topCustomers.map((customer) => (
                <Link
                  key={customer._id}
                  to={`/customers/${customer._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-600 flex items-center justify-center text-secondary-600 dark:text-secondary-300 font-medium">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 dark:text-secondary-100 truncate">
                      {customer.name}
                    </p>
                    <p className="text-sm text-secondary-500 truncate">{customer.email}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const StatusRow: React.FC<{ label: string; count: number; total: number; color: string }> = ({
  label,
  count,
  total,
  color,
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-secondary-600 dark:text-secondary-400">{label}</span>
        <span className="text-secondary-900 dark:text-secondary-100 font-medium">{count}</span>
      </div>
      <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-secondary-200 dark:bg-secondary-700 rounded-xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-secondary-200 dark:bg-secondary-700 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 bg-secondary-200 dark:bg-secondary-700 rounded-xl" />
      <div className="h-80 bg-secondary-200 dark:bg-secondary-700 rounded-xl" />
    </div>
  </div>
);

export default CustomerDashboard;

const InputProps = { rightIcon: React.ReactNode } & (
  | { rightIcon: React.ReactNode }
  | {}
) & React.InputHTMLAttributes<HTMLInputElement>;
