export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'super_admin';
  company?: Company;
  status: 'active' | 'locked' | 'pending';
  trialStartDate: Date;
  trialEndDate: Date;
  invoiceCount: number;
  maxInvoices: number;
  device?: DeviceInfo;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  name: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  ntn?: string;
  stn?: string;
}

export interface DeviceInfo {
  device_id: string;
  browser: string;
  os: string;
  ip_address?: string;
  login_time: Date;
  user_agent: string;
}

export interface Customer {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  company?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  userId: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  tax: number;
  category: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Invoice {
  _id: string;
  userId: string;
  customerId: string;
  customer: Customer;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  termsAndConditions?: string;
  qrCode?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginHistory {
  _id: string;
  userId: string;
  device: DeviceInfo;
  loginTime: Date;
  logoutTime?: Date;
  status: 'success' | 'failed' | 'blocked';
}

export interface SystemSettings {
  trialDays: number;
  freeInvoiceLimit: number;
  whatsappNumber: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}
