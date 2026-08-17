import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Package, Map, Truck, Users, Settings, Bell, 
  BarChart3, FileText, AlertTriangle, Database, ShieldAlert, Key, Route,
  HelpCircle, Search, PlusCircle, Clock
} from 'lucide-react';

export function Sidebar({ isMobileOpen, closeMobile }: { isMobileOpen?: boolean; closeMobile?: () => void }) {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  // Section 77: FINAL SIDEBAR REQUIREMENT
  const getNavItems = () => {
    switch(user.role) {
      case 'Customer':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'My Shipments', path: '/shipments', icon: Package },
          { name: 'Book Shipment', path: '/shipments/create', icon: PlusCircle },
          { name: 'Track Shipment', path: '/tracking', icon: Search },
          { name: 'Support Tickets', path: '/customer/tickets', icon: HelpCircle },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'BusinessClient':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Shipments', path: '/shipments', icon: Package },
          { name: 'Create Shipment', path: '/shipments/create', icon: PlusIcon },
          { name: 'Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Reports', path: '/reports', icon: FileText },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'Administrator':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Pending Dispatch', path: '/admin/shipments/pending', icon: Clock },
          { name: 'All Shipments', path: '/shipments', icon: Package },
          { name: 'Driver Pool', path: '/admin/drivers', icon: Truck },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Operational Reports', path: '/admin/reports', icon: BarChart3 },
          { name: 'Support Tickets', path: '/support/tickets', icon: HelpCircle },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'Driver':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Assigned Deliveries', path: '/driver/deliveries', icon: Truck },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`w-64 bg-navy-900 text-white flex flex-col fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
      isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight border-b border-navy-800">
        ShipTrack <span className="text-primary-500 ml-1">Pro</span>
      </div>
      
      <div className="p-4 border-b border-navy-800 bg-navy-800/50">
        <div className="text-xs text-navy-400 font-semibold mb-1 uppercase tracking-wider">Workspace</div>
        <div className="font-medium truncate">{user.role} View</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-600 text-white font-medium' 
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>


    </div>
  );
}

function PlusIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>; }
function ActivityIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
