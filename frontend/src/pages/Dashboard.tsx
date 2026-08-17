import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CustomerDashboard } from './customer/CustomerDashboard';
import { DriverDashboard } from './driver/DriverDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { SupportDashboard } from './support/SupportDashboard';

export function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'Customer':
      return <CustomerDashboard />;
    case 'Driver':
      return <DriverDashboard />;
    case 'SupportAgent':
      return <SupportDashboard />;
    case 'Administrator':
      return <AdminDashboard />;
    default:
      return <CustomerDashboard />;
  }
}
