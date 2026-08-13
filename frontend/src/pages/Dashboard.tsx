import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { BusinessClientDashboard } from './dashboards/BusinessClientDashboard';
import { DriverDashboard } from './dashboards/DriverDashboard';
import { AdministratorDashboard } from './dashboards/AdministratorDashboard';

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
      return <AdministratorDashboard />;
    default:
      return <div>Dashboard not found for role {user.role}</div>;
  }
}
