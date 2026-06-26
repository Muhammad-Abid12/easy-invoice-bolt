import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiLock, FiUnlock, FiMonitor, FiTrash2, FiEye, FiMail
} from 'react-icons/fi';
import { adminService } from '../../services';
import { User } from '../../types';
import {
  Card, Button, Input, Modal, PageHeader, Badge, EmptyState
} from '../../components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const result = await adminService.getCustomers();
      setCustomers(result.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
      await adminService.lockCustomer(id);
      setCustomers(customers.map((c) => (c._id === id ? { ...c, status: 'locked' } : c)));
      toast.success('Account locked');
    } catch {
      toast.error('Failed to lock account');
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await adminService.unlockCustomer(id);
      setCustomers(customers.map((c) => (c._id === id ? { ...c, status: 'active' } : c)));
      toast.success('Account unlocked');
    } catch {
      toast.error('Failed to unlock account');
    }
  };

  const handleResetDevice = async (id: string) => {
    try {
      await adminService.resetDevice(id);
      setCustomers(customers.map((c) => (c._id === id ? { ...c, device: undefined } : c)));
      toast.success('Device reset');
    } catch {
      toast.error('Failed to reset device');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await adminService.deleteCustomer(id);
      setCustomers(customers.filter((c) => c._id !== id));
      toast.success('Customer deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewDetails = (customer: User) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  if (loading) return null;

  return (
    <div>
      <PageHeader title="Customer Management" subtitle="View and manage all customers" />

      <Card className="mb-6">
        <Input
          placeholder="Search customers..."
          icon={<FiSearch className="w-5 h-5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {filteredCustomers.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 dark:border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Trial</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Invoices</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Device</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Last Login</th>
                <th className="text-right py-3 px-4 font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-secondary-100 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">
                          {customer.name}
                        </p>
                        <p className="text-sm text-secondary-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={customer.status === 'active' ? 'success' : customer.status === 'locked' ? 'error' : 'warning'}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p>{customer.invoiceCount}/{customer.maxInvoices}</p>
                      <p className="text-secondary-500 text-xs">
                        {customer.trialEndDate && new Date(customer.trialEndDate) > new Date()
                          ? `${Math.ceil((new Date(customer.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`
                          : 'Expired'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{customer.invoiceCount}</td>
                  <td className="py-3 px-4">
                    {customer.device ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">None</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-secondary-500">
                    {customer.lastLogin ? format(new Date(customer.lastLogin), 'MMM dd, yyyy') : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => viewDetails(customer)}
                        className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {customer.status === 'active' ? (
                        <button
                          onClick={() => handleLock(customer._id)}
                          className="p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 rounded"
                          title="Lock Account"
                        >
                          <FiLock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlock(customer._id)}
                          className="p-2 hover:bg-success-50 dark:hover:bg-success-900/20 text-success-600 rounded"
                          title="Unlock Account"
                        >
                          <FiUnlock className="w-4 h-4" />
                        </button>
                      )}
                      {customer.device && (
                        <button
                          onClick={() => handleResetDevice(customer._id)}
                          className="p-2 hover:bg-warning-50 dark:hover:bg-warning-900/20 text-warning-600 rounded"
                          title="Reset Device"
                        >
                          <FiMonitor className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 rounded"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Customer Details" size="lg">
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">Name</p>
                <p className="font-medium">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Email</p>
                <p className="font-medium">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Phone</p>
                <p className="font-medium">{selectedCustomer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Status</p>
                <Badge variant={selectedCustomer.status === 'active' ? 'success' : 'error'}>
                  {selectedCustomer.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Registered</p>
                <p className="font-medium">{format(new Date(selectedCustomer.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Invoice Count</p>
                <p className="font-medium">{selectedCustomer.invoiceCount}/{selectedCustomer.maxInvoices}</p>
              </div>
            </div>

            {selectedCustomer.company && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-secondary-900 dark:text-secondary-100">Company Info</h4>
                <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
                  <p className="font-medium">{selectedCustomer.company.name}</p>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {selectedCustomer.company.address}, {selectedCustomer.company.city}
                  </p>
                </div>
              </div>
            )}

            {selectedCustomer.device && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-secondary-900 dark:text-secondary-100">Device Info</h4>
                <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-secondary-500">Browser:</span> {selectedCustomer.device.browser}</div>
                  <div><span className="text-secondary-500">OS:</span> {selectedCustomer.device.os}</div>
                  <div><span className="text-secondary-500">Device ID:</span> {selectedCustomer.device.device_id.slice(0, 20)}...</div>
                  <div><span className="text-secondary-500">Login:</span> {format(new Date(selectedCustomer.device.login_time), 'MMM dd, HH:mm')}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {selectedCustomer.status === 'active' ? (
                <Button variant="danger" icon={<FiLock />} onClick={() => { handleLock(selectedCustomer._id); setIsDetailModalOpen(false); }}>
                  Lock Account
                </Button>
              ) : (
                <Button variant="success" icon={<FiUnlock />} onClick={() => { handleUnlock(selectedCustomer._id); setIsDetailModalOpen(false); }}>
                  Unlock Account
                </Button>
              )}
              {selectedCustomer.device && (
                <Button variant="secondary" icon={<FiMonitor />} onClick={() => { handleResetDevice(selectedCustomer._id); setIsDetailModalOpen(false); }}>
                  Reset Device
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCustomersPage;
