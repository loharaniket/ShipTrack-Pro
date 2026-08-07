import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-6">
      <div className="glass p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center space-y-6">
        <Package className="mx-auto h-16 w-16 text-[var(--color-brand)]" />
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
          Welcome to ShipTrack-Pro, {currentUser?.firstName}!
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Your centralized hub for managing and tracking shipments. 
        </p>
        
        <div className="pt-6">
          <Button onClick={() => navigate('/shipments')} className="gap-2 text-lg px-8 py-3">
            Go to Shipments
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
