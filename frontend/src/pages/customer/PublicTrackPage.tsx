import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TrackShipment } from './TrackShipment';
import { Package, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PublicTrackPage() {
  const { user } = useAuth();
  const { trackingNumber } = useParams<{ trackingNumber?: string }>();

  // If user is already authenticated, redirect to the internal dashboard tracking route with sidebar
  if (user) {
    return <Navigate to={trackingNumber ? `/tracking/${trackingNumber}` : '/tracking'} replace />;
  }

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Public Top Navbar */}
      <header className="bg-navy-900 text-white border-b border-navy-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <Package className="h-5 w-5" />
          </div>
          <span>
            ShipTrack <span className="text-primary-500">Pro</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/auth/login">
            <Button variant="ghost" size="sm" className="text-navy-200 hover:text-white hover:bg-navy-800">
              <LogIn className="h-4 w-4 mr-1.5" /> Sign In
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="sm" variant="primary" className="font-semibold">
              <UserPlus className="h-4 w-4 mr-1.5" /> Register
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <TrackShipment />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-navy-100 py-6 text-center text-xs text-navy-400">
        &copy; {new Date().getFullYear()} ShipTrack Pro Logistics. All rights reserved.
      </footer>
    </div>
  );
}
