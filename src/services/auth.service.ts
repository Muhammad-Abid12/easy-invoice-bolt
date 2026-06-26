import api from './api';
import { User, LoginHistory, DeviceInfo } from '../types';

interface LoginResponse {
  user: User;
  token: string;
  requiresDeviceVerification?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
    email: string;
  };
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  company?: Partial<RegisterData['company']>;
}

export const authService = {
  async login(email: string, password: string, deviceInfo: DeviceInfo): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password, deviceInfo });
    return response.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(): Promise<void> {
    await api.post('/auth/resend-verification');
  },

  async getLoginHistory(): Promise<LoginHistory[]> {
    const response = await api.get('/auth/login-history');
    return response.data;
  },

  async resetDevice(userId: string): Promise<void> {
    await api.post('/auth/reset-device', { userId });
  },
};
