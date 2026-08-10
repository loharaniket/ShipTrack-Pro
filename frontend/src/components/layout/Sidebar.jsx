import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Settings, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { currentUser } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  ];

  if (['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'BUSINESS_CLIENT', 'SUPPORT_AGENT'].includes(currentUser?.role)) {
    navItems.push({ name: 'Shipments', path: '/shipments', icon: <Truck className="h-5 w-5" /> });
  }

  if (['ADMINISTRATOR', 'LOGISTICS_OPERATOR'].includes(currentUser?.role)) {
    navItems.push({ name: 'Dispatch', path: '/dispatch', icon: <Map className="h-5 w-5" /> });
  }

  if (['ADMINISTRATOR'].includes(currentUser?.role)) {
    navItems.push({ name: 'Fleet', path: '/fleet', icon: <Users className="h-5 w-5" /> });
  }

  navItems.push({ name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> });

  if (currentUser?.role === 'ADMINISTRATOR') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: <Users className="h-5 w-5" /> });
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-gray-50/50 dark:bg-gray-900/50 md:flex h-[calc(100vh-4rem)]">
      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-brand)] bg-opacity-10 text-[var(--color-brand)] dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
