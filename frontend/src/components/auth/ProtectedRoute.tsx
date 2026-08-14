import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-navy-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <CardContent className="space-y-4 pt-6">
             <ShieldAlert className="h-16 w-16 text-danger-500 mx-auto" />
             <h1 className="text-2xl font-bold text-navy-900">403 Access Restricted</h1>
             <p className="text-navy-500">
               You don't have permission to access this resource.
             </p>
             <div className="pt-4">
               <Button onClick={() => window.location.href = '/'}>Return to Dashboard</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
