import api from './api';
import { Product } from '../types';

interface ProductFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: Omit<Product, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async search(query: string): Promise<Product[]> {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/products/categories');
    return response.data;
  },
};
