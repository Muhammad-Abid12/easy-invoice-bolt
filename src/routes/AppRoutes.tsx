import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout, DashboardLayout } from '../components/layout';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '../pages/auth';
import { CustomerDashboard, TrialExpiredPage } from '../pages/dashboard';
import { CustomersListPage } from '../pages/customers';
import { ProductsListPage } from '../pages/products';
import { InvoicesListPage } from '../pages/invoices';
import { SettingsPage } from '../pages/settings';
import { AdminDashboard, AdminCustomersPage, AdminReportsPage, AdminSettingsPage } from '../pages/admin';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Trial Expired */}
      <Route path="/trial-expired" element={<TrialExpiredPage />} />

      {/* Customer Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="customer">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/invoices" element={<InvoicesListPage />} />
        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="super_admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<AdminCustomersPage />} />
        <Route path="/admin/invoices" element={<InvoicesListPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
