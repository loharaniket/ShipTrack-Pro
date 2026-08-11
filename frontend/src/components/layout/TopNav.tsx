import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-navy-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 -ml-2 text-navy-500 hover:text-navy-700">
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center text-sm text-navy-500">
          <span>Overview</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-navy-900">Dashboard</span>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center max-w-lg px-4">
        <Input 
          placeholder="Search Tracking ID, Order ID..." 
          icon={<Search className="h-4 w-4" />}
          className="h-9 w-full bg-navy-50"
        />
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
      </div>
    </header>
  );
}
