import api from './api';
import { Customer } from '../types';

interface CustomerFilters {
  search?: string;
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

export const customerService = {
  async getAll(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const response = await api.get('/customers', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async create(data: Omit<Customer, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async search(query: string): Promise<Customer[]> {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
  },
};
