import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PackageSearch, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-30 w-full flex h-16 shrink-0 items-center border-b shadow-sm transition-all">
      <div className="flex h-16 items-center px-4 md:px-6 w-full justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <PackageSearch className="h-6 w-6 text-[var(--color-brand)]" />
          <span className="font-bold text-lg tracking-tight">ShipTrack<span className="text-[var(--color-brand)]">-Pro</span></span>
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{currentUser.role}</span>
            </div>
            <Button variant="ghost" className="px-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
