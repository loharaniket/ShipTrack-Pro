import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Building2, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Users Management', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Company Management', path: '/admin/companies', icon: <Building2 className="h-5 w-5" /> },
    { name: 'Route Planning', path: '/admin/routes/plan', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18"/><path d="M3 6h18"/><path d="M3 12h18"/></svg> },
    { name: 'Active Routes', path: '/admin/routes/active', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> },
    { name: 'Tracking Events', path: '/admin/tracking/events', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">System configuration and management</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`
                flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${location.pathname.startsWith(tab.path)
                  ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-700'
                }
              `}
            >
              {tab.icon}
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
