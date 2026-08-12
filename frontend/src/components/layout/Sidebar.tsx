import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Package, Map, Truck, Users, Settings, Bell, 
  BarChart3, FileText, AlertTriangle, Database, ShieldAlert, Key, Route
} from 'lucide-react';

export function Sidebar() {
  const { user, login } = useAuth();
  
  if (!user) return null;

  // Section 77: FINAL SIDEBAR REQUIREMENT
  const getNavItems = () => {
    switch(user.role) {
      case 'Customer':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'My Shipments', path: '/shipments', icon: Package },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'BusinessClient':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Shipments', path: '/shipments', icon: Package },
          { name: 'Create Shipment', path: '/shipments/create', icon: PlusIcon },
          { name: 'Routes', path: '/routes/planner', icon: Route },
          { name: 'ETA Prediction', path: '/intelligence/eta', icon: BarChart3 },
          { name: 'Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Reports', path: '/reports', icon: FileText },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Customers', path: '/customers', icon: Users },
        ];
      case 'LogisticsOperator':
        return [
          { name: 'Operations Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Shipments', path: '/shipments', icon: Package },
          { name: 'Create Shipment', path: '/shipments/create', icon: PlusIcon },
          { name: 'Active Deliveries', path: '/operations', icon: Truck },
          { name: 'Drivers', path: '/drivers', icon: Users },
          { name: 'Routes', path: '/routes/planner', icon: Route },
          { name: 'Geo-fences', path: '/routes/geofencing', icon: Map },
          { name: 'ETA Prediction', path: '/intelligence/eta', icon: BarChart3 },
          { name: 'Proof of Delivery', path: '/pod', icon: FileText },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'SupportAgent':
        return [
          { name: 'Support Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Shipments', path: '/shipments', icon: Package },
          { name: 'Customers', path: '/customers', icon: Users },
          { name: 'Communication', path: '/communications/logs', icon: Bell },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Reports', path: '/reports', icon: FileText },
        ];
      case 'Administrator':
        return [
          { name: 'Admin Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Organizations', path: '/customers', icon: Users },
          { name: 'Users', path: '/users', icon: Users },
          { name: 'Roles & Permissions', path: '/roles', icon: ShieldAlert },
          { name: 'Shipments', path: '/shipments', icon: Package },
          { name: 'Drivers', path: '/drivers', icon: Users },
          { name: 'Routes', path: '/routes/planner', icon: Route },
          { name: 'Geo-fences', path: '/routes/geofencing', icon: Map },
          { name: 'ETA Prediction', path: '/intelligence/eta', icon: BarChart3 },
          { name: 'Proof of Delivery', path: '/pod', icon: FileText },
          { name: 'Audit Logs', path: '/audit', icon: FileText },
          { name: 'System Health', path: '/system-health', icon: ActivityIcon },
          { name: 'System Settings', path: '/settings', icon: Settings },
        ];
      case 'Driver':
        return [
          { name: 'Driver Dashboard', path: '/driver-app', icon: LayoutDashboard },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-navy-900 text-white flex flex-col hidden md:flex">
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

      {/* Demo Account Switcher */}
      <div className="p-4 border-t border-navy-800 bg-navy-950">
        <div className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Demo Switcher</div>
        <select 
          className="w-full bg-navy-900 border border-navy-700 text-sm text-white rounded p-2 focus:ring-primary-500 focus:border-primary-500"
          value={user.role}
          onChange={(e) => {
            const role = e.target.value as any;
            login({ ...user, role });
            window.location.href = '/';
          }}
        >
          <option value="Customer">Customer Demo</option>
          <option value="BusinessClient">Business Client Demo</option>
          <option value="LogisticsOperator">Logistics Operator Demo</option>
          <option value="Driver">Driver Demo</option>
          <option value="SupportAgent">Support Agent Demo</option>
          <option value="Administrator">Administrator Demo</option>
        </select>
      </div>
    </div>
  );
}

function PlusIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>; }
function ActivityIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
