import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import WhatsAppButton from './WhatsAppButton';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          <Outlet />
        </div>
      </main>
      <WhatsAppButton />
    </div>
  );
};

export default DashboardLayout;
