import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function PermissionDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-navy-100 p-4 rounded-full mb-4">
        <Lock className="h-12 w-12 text-navy-500" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">Access Denied</h2>
      <p className="text-navy-500 max-w-md mb-6">
        You don't have permission to access this resource. Please contact your system administrator if you believe this is an error.
      </p>
      <Button onClick={() => navigate(-1)} variant="outline">
        Go Back
      </Button>
    </div>
  );
}
