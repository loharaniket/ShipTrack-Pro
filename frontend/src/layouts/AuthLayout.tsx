import React from 'react';
import { Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-navy-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">
        <Truck className="h-12 w-12 text-primary-600 mb-4" />
        <h2 className="text-center text-3xl font-extrabold text-navy-900">ShipTrack Pro</h2>
        <p className="mt-2 text-center text-sm text-navy-600">
          Complete shipment visibility from pickup to proof of delivery
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-navy-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
