import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FiPlus, FiSearch, FiEye, FiDownload, FiSend, FiTrash2,
  FiMinus, FiX, FiCalendar
} from 'react-icons/fi';
import { invoiceService, customerService, productService } from '../../services';
import { Invoice, Customer, Product, InvoiceItem } from '../../types';
import {
  Card, Button, Input, Modal, PageHeader, Badge, EmptyState, Select
} from '../../components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(z.object({
    productId: z.string().optional(),
    name: z.string().min(1, 'Item name required'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be non-negative'),
    tax: z.number().min(0).max(100),
    discount: z.number().min(0).max(100),
  })).min(1, 'At least one item required'),
  discountAmount: z.number().min(0).default(0),
  shippingAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

type InvoiceFormInputs = z.infer<typeof invoiceSchema>;

const InvoicesListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormInputs>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ name: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 }],
      discountAmount: 0,
      shippingAmount: 0,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchDiscount = watch('discountAmount') || 0;
  const watchShipping = watch('shippingAmount') || 0;

  const subtotal = watchItems.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    const tax = item.tax || 0;
    const discount = item.discount || 0;
    const lineTotal = qty * price * (1 + tax / 100) * (1 - discount / 100);
    return sum + lineTotal;
  }, 0);

  const total = subtotal - watchDiscount + watchShipping;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        invoiceService.getAll(),
        customerService.getAll(),
        productService.getAll(),
      ]);
      setInvoices(invoicesRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    reset({
      items: [{ name: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 }],
      discountAmount: 0,
      shippingAmount: 0,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const onSubmit = async (data: InvoiceFormInputs) => {
    try {
      const customer = customers.find((c) => c._id === data.customerId);
      if (!customer) return toast.error('Customer not found');

      const items: InvoiceItem[] = data.items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax,
        discount: item.discount,
        total: item.quantity * item.unitPrice * (1 + item.tax / 100) * (1 - item.discount / 100),
      }));

      await invoiceService.create({
        customerId: data.customerId,
        items,
        discountAmount: data.discountAmount,
        shippingAmount: data.shippingAmount,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        dueDate: new Date(data.dueDate),
      });

      toast.success('Invoice created');
      closeModal();
      loadData();
    } catch {
      toast.error('Failed to create invoice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await invoiceService.delete(id);
      setInvoices(invoices.filter((i) => i._id !== id));
      toast.success('Invoice deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const addProductToItems = (product: Product) => {
    append({
      productId: product._id,
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      tax: product.tax,
      discount: 0,
    });
  };

  const filteredInvoices = invoices.filter((i) =>
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Create and manage your invoices"
        action={
          <Button icon={<FiPlus />} onClick={openModal}>
            Create Invoice
          </Button>
        }
      />

      <Card className="mb-6">
        <Input
          placeholder="Search invoices..."
          icon={<FiSearch />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          action={<Button onClick={openModal}>Create Invoice</Button>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 dark:border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Invoice</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <motion.tr
                  key={invoice._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-secondary-100 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                >
                  <td className="py-3 px-4">
                    <Link to={`/invoices/${invoice._id}`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-secondary-900 dark:text-secondary-100">{invoice.customer.name}</td>
                  <td className="py-3 px-4 text-secondary-500">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-4 font-medium">PKR {invoice.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : invoice.status === 'overdue' ? 'error' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/invoices/${invoice._id}`} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded">
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <button className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded">
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(invoice._id)} className="p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 rounded">
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Invoice" size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Customer *"
              options={customers.map((c) => ({ value: c._id, label: c.name }))}
              error={errors.customerId?.message}
              {...register('customerId')}
            />
            <Input label="Issue Date" type="date" {...register('issueDate')} />
            <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          </div>

          <div className="border rounded-lg p-4 dark:border-secondary-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100">Items</h4>
              <div className="flex gap-2">
                <select
                  className="text-sm border rounded-lg px-3 py-1.5 dark:bg-secondary-800 dark:border-secondary-600"
                  onChange={(e) => {
                    const product = products.find((p) => p._id === e.target.value);
                    if (product) addProductToItems(product);
                    e.target.value = '';
                  }}
                >
                  <option value="">Add from products...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} - PKR {p.price}</option>
                  ))}
                </select>
                <Button type="button" size="sm" variant="outline" icon={<FiPlus />} onClick={() => append({ name: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 })}>
                  Add Item
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <Input
                      placeholder="Item name"
                      error={errors.items?.[index]?.name?.message}
                      {...register(`items.${index}.name` as const)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      error={errors.items?.[index]?.quantity?.message}
                      {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      error={errors.items?.[index]?.unitPrice?.message}
                      {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Tax%"
                      {...register(`items.${index}.tax` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Disc%"
                      {...register(`items.${index}.discount` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2.5 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <p className="text-center text-secondary-500 py-4">Add at least one item</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Discount (PKR)" type="number" step="0.01" {...register('discountAmount', { valueAsNumber: true })} />
            <Input label="Shipping (PKR)" type="number" step="0.01" {...register('shippingAmount', { valueAsNumber: true })} />
            <div className="col-span-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-secondary-600 dark:text-secondary-400">Subtotal</span>
                <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoicesListPage;
