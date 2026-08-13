import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Administrator' | 'Driver' | 'Customer' | 'BusinessClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (newUser: User) => setUser(newUser);
  const logout = () => setUser(null);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    
    // RBAC logic matrix would go here
    return true; // placeholder
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
