import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiPackage, FiFileText, FiSettings, FiLogOut,
  FiMenu, FiX, FiSun, FiMoon, FiBarChart2, FiUser
} from 'react-icons/fi';
import { useAuth, useTheme } from '../../context';
import { User } from '../../types';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'super_admin';

  const adminNavItems: NavItem[] = [
    { icon: FiHome, label: 'Dashboard', path: '/admin' },
    { icon: FiUsers, label: 'Customers', path: '/admin/customers' },
    { icon: FiFileText, label: 'Invoices', path: '/admin/invoices' },
    { icon: FiBarChart2, label: 'Reports', path: '/admin/reports' },
    { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
  ];

  const customerNavItems: NavItem[] = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiFileText, label: 'Invoices', path: '/invoices' },
    { icon: FiUsers, label: 'Customers', path: '/customers' },
    { icon: FiPackage, label: 'Products', path: '/products' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-lg">
          E
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-secondary-900 dark:text-secondary-100">
            Easy Invoice
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            {isAdmin ? 'Admin Panel' : 'Manager'}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400"
          >
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center">
            <FiUser className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 h-screen fixed left-0 top-0">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-xl bg-white dark:bg-secondary-800 shadow-soft border border-secondary-200 dark:border-secondary-700"
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-secondary-800 z-50 shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
