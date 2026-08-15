import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Permission } from '@/types/domain';
import { authService } from '@/services/authService';

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
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  const login = (newUser: User) => setUser(newUser);
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  if (isInitializing) {
    return <div>Loading...</div>; // Could be a better loading spinner
  }

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
