import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Navigation, CheckCircle, Package, Truck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DriverDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Driver Dashboard</h1>
        <p className="text-navy-500">Welcome back. Here is your delivery queue for today.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Today's Tasks</p>
              <h3 className="text-2xl font-bold text-navy-900">14</h3>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-navy-900">6</h3>
            </div>
            <div className="p-3 bg-success-50 rounded-lg text-success-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-warning-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-navy-900">8</h3>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg text-warning-600">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-danger-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Issues Reported</p>
              <h3 className="text-2xl font-bold text-navy-900">0</h3>
            </div>
            <div className="p-3 bg-danger-50 rounded-lg text-danger-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Delivery */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Active Delivery</h2>
          <Card className="border-primary-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded mb-2">IN PROGRESS</span>
                  <h3 className="text-xl font-bold text-navy-900">Shipment ST1005</h3>
                  <p className="text-navy-500">Customer: Acme Corp</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-navy-500">ETA</p>
                  <p className="text-lg font-bold text-primary-600">14 mins</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-navy-700 bg-navy-50 p-4 rounded-lg mb-6">
                <div className="flex flex-col flex-1 relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-navy-400 shrink-0" />
                    <span className="font-medium text-navy-900">Mumbai Distribution Center</span>
                  </div>
                  <div className="w-0.5 h-6 bg-navy-200 ml-1.5 absolute top-3" />
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-3 h-3 rounded-full bg-primary-500 shrink-0" />
                    <span className="font-medium text-navy-900">Pune Business Park</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button className="flex-1" size="lg" onClick={() => navigate('/driver-app')}>
                  <Navigation className="h-5 w-5 mr-2" /> Start Navigation
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/shipments/ST1005')}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Stops */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Next Stops</h2>
          <Card>
            <CardContent className="p-0 divide-y divide-navy-100">
              {[
                { id: 'ST1006', dest: 'Hinjewadi Phase 2', status: 'Assigned' },
                { id: 'ST1007', dest: 'Baner Tech Park', status: 'Assigned' },
                { id: 'ST1008', dest: 'Aundh Plaza', status: 'Assigned' },
              ].map((stop, i) => (
                <div key={stop.id} className="p-4 hover:bg-navy-50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-navy-900">{stop.id}</span>
                    <span className="text-xs font-medium text-navy-500">Stop {i + 2}</span>
                  </div>
                  <p className="text-sm text-navy-600 truncate">{stop.dest}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
