import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'super_admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === 'super_admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  if (user.role === 'customer' && user.status === 'locked') {
    return <Navigate to="/trial-expired" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
