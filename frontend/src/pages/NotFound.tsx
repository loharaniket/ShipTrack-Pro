import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-navy-100 p-5 rounded-full mb-6">
        <AlertTriangle className="h-16 w-16 text-warning-500" />
      </div>
      <h1 className="text-4xl font-bold text-navy-900 mb-3">404</h1>
      <h2 className="text-2xl font-semibold text-navy-800 mb-2">Page Not Found</h2>
      <p className="text-navy-500 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Button onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
