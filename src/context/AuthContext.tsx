import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, DeviceInfo } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
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
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const ua = navigator.userAgent;
  const browser = ua.includes('Chrome') ? 'Chrome' :
                  ua.includes('Firefox') ? 'Firefox' :
                  ua.includes('Safari') ? 'Safari' :
                  ua.includes('Edge') ? 'Edge' : 'Unknown';
  const os = ua.includes('Windows') ? 'Windows' :
              ua.includes('Mac') ? 'MacOS' :
              ua.includes('Linux') ? 'Linux' :
              ua.includes('Android') ? 'Android' :
              ua.includes('iPhone') ? 'iOS' : 'Unknown';
  const device_id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    device_id,
    browser,
    os,
    login_time: new Date(),
    user_agent: ua,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const deviceInfo = await getDeviceInfo();
      const response = await authService.login(email, password, deviceInfo);
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: Parameters<NonNullable<AuthContextType>['register']>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const deviceInfo = await getDeviceInfo();
      const response = await authService.register({ ...data, deviceInfo: deviceInfo });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await authService.updateProfile(data as Parameters<typeof authService.updateProfile>[0]);
    setUser(updated);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
