import api from './api';
import { Invoice, InvoiceItem } from '../types';

interface InvoiceFilters {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
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

interface InvoiceStats {
  todaySales: number;
  monthlySales: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export const invoiceService = {
  async getAll(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get('/invoices', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async create(data: {
    customerId: string;
    items: InvoiceItem[];
    discountAmount?: number;
    shippingAmount?: number;
    notes?: string;
    termsAndConditions?: string;
    dueDate: Date;
  }): Promise<Invoice> {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  async updateStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  async getStats(): Promise<InvoiceStats> {
    const response = await api.get('/invoices/stats');
    return response.data;
  },

  async generatePdf(id: string): Promise<Blob> {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  async sendByEmail(id: string, email: string): Promise<void> {
    await api.post(`/invoices/${id}/send`, { email });
  },

  async getNextInvoiceNumber(): Promise<string> {
    const response = await api.get('/invoices/next-number');
    return response.data.invoiceNumber;
  },
};
