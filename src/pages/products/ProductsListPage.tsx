import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage, FiDollarSign
} from 'react-icons/fi';
import { productService } from '../../services';
import { Product } from '../../types';
import {
  Card, Button, Input, Modal, PageHeader, Badge, EmptyState, Select
} from '../../components/ui';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  tax: z.number().min(0, 'Tax must be non-negative').max(100),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().default('piece'),
});

type ProductFormInputs = z.infer<typeof productSchema>;

const ProductsListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productSchema),
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Home & Garden',
    'Office Supplies',
    'Services',
    'Other',
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await productService.getAll();
      setProducts(result.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    if (product) {
      reset(product);
    } else {
      reset({
        name: '',
        sku: '',
        price: 0,
        stock: 0,
        tax: 0,
        category: '',
        unit: 'piece',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = async (data: ProductFormInputs) => {
    try {
      if (editingProduct) {
        const updated = await productService.update(editingProduct._id, data);
        setProducts(products.map((p) => (p._id === editingProduct._id ? updated : p)));
        toast.success('Product updated');
      } else {
        const created = await productService.create(data);
        setProducts([created, ...products]);
        toast.success('Product created');
      }
      closeModal();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        action={
          <Button icon={<FiPlus />} onClick={() => openModal()}>
            Add Product
          </Button>
        }
      />

      <Card className="mb-6">
        <Input
          placeholder="Search products..."
          icon={<FiSearch />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<FiPackage className="w-12 h-12" />}
          title="No products found"
          action={<Button onClick={() => openModal()}>Add Product</Button>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 dark:border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Product</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Price</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Tax</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500">Category</th>
                <th className="text-right py-3 px-4 font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-secondary-100 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">{product.name}</p>
                      <p className="text-sm text-secondary-500 truncate max-w-xs">{product.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{product.sku}</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">PKR {product.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                      {product.stock} {product.unit}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{product.tax}%</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{product.category}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(product)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 rounded">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Product Name *" error={errors.name?.message} {...register('name')} />
            <Input label="SKU *" error={errors.sku?.message} {...register('sku')} />
            <Input label="Price (PKR) *" type="number" step="0.01" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
            <Input label="Stock *" type="number" error={errors.stock?.message} {...register('stock', { valueAsNumber: true })} />
            <Input label="Tax (%)" type="number" step="0.1" error={errors.tax?.message} {...register('tax', { valueAsNumber: true })} />
            <Select label="Category *" options={categories.map((c) => ({ value: c, label: c }))} error={errors.category?.message} {...register('category')} />
          </div>
          <Input label="Description" {...register('description')} />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingProduct ? 'Update' : 'Add'} Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsListPage;
