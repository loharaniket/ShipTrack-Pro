import React from 'react';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-navy-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center flex-1">
        <button 
          className="md:hidden p-2 -ml-2 text-navy-500 hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
          onClick={onMenuClick}
          aria-label="Open mobile menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center text-sm text-navy-500">
          <span>Overview</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-navy-900">Dashboard</span>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center max-w-lg px-4">
        <button 
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
          }}
          className="h-9 w-full bg-navy-50 text-navy-500 rounded-md border border-navy-200 flex items-center px-3 hover:bg-navy-100 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Search (Press Ctrl+K)</span>
        </button>
      </div>

      <div className="flex items-center flex-1 justify-end space-x-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-success-500" />
          <span className="text-xs text-navy-500 hidden sm:block">Connected</span>
        </div>
        <button className="p-2 text-navy-500 hover:text-navy-700 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </button>

        {/* User Menu */}
        <div className="relative group">
          <Link to="/profile" className="flex items-center space-x-3 hover:bg-navy-50 p-1.5 rounded-lg transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-navy-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-navy-500 leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-navy-400 hidden md:block" />
          </Link>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-navy-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="py-1">
              <Link to="/profile" className="block px-4 py-2 text-sm text-navy-700 hover:bg-navy-50">Profile Settings</Link>
              <button 
                onClick={() => {
                  logout();
                  window.location.href = '/auth/login';
                }}
                className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
