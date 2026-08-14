import React, { createContext, useContext, useState } from 'react';
import { User, Role, Permission } from '@/types/domain';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Administrator: [
    'VIEW_ALL_SHIPMENTS',
    'CREATE_SHIPMENT',
    'MANAGE_DRIVERS',
    'MANAGE_VEHICLES',
    'ASSIGN_SHIPMENTS',
    'CREATE_ROUTE',
    'OPTIMIZE_ROUTE',
    'DISPATCH_ROUTE',
    'VIEW_REPORTS',
    'MANAGE_USERS'
  ],
  Driver: [
    'VIEW_OWN_SHIPMENTS',
    'UPDATE_ASSIGNED_SHIPMENT',
    'SUBMIT_POD'
  ],
  Customer: [
    'VIEW_OWN_SHIPMENTS'
  ],
  BusinessClient: [
    'VIEW_OWN_SHIPMENTS',
    'CREATE_SHIPMENT',
    'VIEW_REPORTS'
  ]
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (newUser: User) => setUser(newUser);
  const logout = () => setUser(null);

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
