import api from './api';
import { User, SystemSettings, Invoice } from '../types';

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

interface CustomerFilters {
  search?: string;
  status?: string;
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

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<User>> {
    const response = await api.get('/admin/customers', { params: filters });
    return response.data;
  },

  async getCustomerById(id: string): Promise<User> {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/admin/customers/${id}`, data);
    return response.data;
  },

  async lockCustomer(id: string): Promise<void> {
    await api.post(`/admin/customers/${id}/lock`);
  },

  async unlockCustomer(id: string): Promise<void> {
    await api.post(`/admin/customers/${id}/unlock`);
  },

  async resetDevice(id: string): Promise<void> {
    await api.post(`/admin/customers/${id}/reset-device`);
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/admin/customers/${id}`);
  },

  async getInvoices(filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get('/admin/invoices', { params: filters });
    return response.data;
  },

  async getSettings(): Promise<SystemSettings> {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  async getReports(type: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{
    invoices: number;
    revenue: number;
    newCustomers: number;
  }> {
    const response = await api.get('/admin/reports', { params: { type } });
    return response.data;
  },

  async exportReport(type: 'daily' | 'weekly' | 'monthly' | 'yearly', format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await api.get('/admin/reports/export', {
      params: { type, format },
      responseType: 'blob'
    });
    return response.data;
  },
};
