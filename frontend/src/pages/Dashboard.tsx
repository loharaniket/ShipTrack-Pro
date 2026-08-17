import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CustomerDashboard } from './customer/CustomerDashboard';
import { BusinessClientDashboard } from './dashboards/BusinessClientDashboard';
import { DriverDashboard } from './driver/DriverDashboard';
import { AdminDashboard } from './admin/AdminDashboard';

export function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'Customer':
      return <CustomerDashboard />;
    case 'BusinessClient':
      return <BusinessClientDashboard />;
    case 'Driver':
      return <DriverDashboard />;
    case 'Administrator':
      return <AdminDashboard />;
    default:
      return <CustomerDashboard />;
  }
}
