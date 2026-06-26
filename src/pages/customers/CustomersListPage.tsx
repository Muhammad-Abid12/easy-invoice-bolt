import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone,
  FiMapPin, FiX
} from 'react-icons/fi';
import { customerService } from '../../services';
import { Customer } from '../../types';
import {
  Card, Button, Input, Modal, PageHeader, Badge, EmptyState
} from '../../components/ui';
import toast from 'react-hot-toast';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  country: z.string().default('Pakistan'),
  postalCode: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormInputs = z.infer<typeof customerSchema>;

const CustomersListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const result = await customerService.getAll();
      setCustomers(result.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    if (customer) {
      reset(customer);
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Pakistan',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    reset();
  };

  const onSubmit = async (data: CustomerFormInputs) => {
    try {
      if (editingCustomer) {
        const updated = await customerService.update(editingCustomer._id, data);
        setCustomers(customers.map((c) => (c._id === editingCustomer._id ? updated : c)));
        toast.success('Customer updated successfully');
      } else {
        const created = await customerService.create(data);
        setCustomers([created, ...customers]);
        toast.success('Customer created successfully');
      }
      closeModal();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    setDeletingId(id);
    try {
      await customerService.delete(id);
      setCustomers(customers.filter((c) => c._id !== id));
      toast.success('Customer deleted');
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="animate-pulse space-y-4">{/* Skeleton */}</div>;
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer database"
        action={
          <Button icon={<FiPlus className="w-4 h-4" />} onClick={() => openModal()}>
            Add Customer
          </Button>
        }
      />

      <Card className="mb-6">
        <Input
          placeholder="Search customers by name or email..."
          icon={<FiSearch className="w-5 h-5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={searchQuery ? 'Try a different search term' : 'Add your first customer to get started'}
          action={
            <Button onClick={() => openModal()} icon={<FiPlus className="w-4 h-4" />}>
              Add Customer
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                        {customer.name}
                      </h3>
                      {customer.company && (
                        <Badge variant="secondary" size="sm">{customer.company}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(customer)}
                      className="p-2 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      disabled={deletingId === customer._id}
                      className="p-2 text-secondary-400 hover:text-error-600 dark:hover:text-error-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                    <FiMail className="w-4 h-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                    <FiPhone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                    <FiMapPin className="w-4 h-4" />
                    <span className="truncate">{customer.city}, {customer.country}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Company Name"
              placeholder="Company Ltd."
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone *"
              placeholder="+92 300 1234567"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Address *"
              placeholder="Street address"
              error={errors.address?.message}
              {...register('address')}
            />
            <Input
              label="City *"
              placeholder="Karachi"
              error={errors.city?.message}
              {...register('city')}
            />
            <Input
              label="State/Province"
              placeholder="Sindh"
              error={errors.state?.message}
              {...register('state')}
            />
            <Input
              label="Postal Code"
              placeholder="74000"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersListPage;
