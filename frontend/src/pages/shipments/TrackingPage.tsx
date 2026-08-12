import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, MapPin, CheckCircle2, Clock, Truck, ArrowLeft, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { LiveMap } from '@/components/maps/LiveMap';

export function TrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const trackingSteps = [
    { label: 'Order Placed', time: 'Oct 24, 09:00 AM', completed: true },
    { label: 'Picked Up', time: 'Oct 24, 11:30 AM', completed: true },
    { label: 'In Transit', time: 'Oct 24, 02:15 PM', completed: true },
    { label: 'Out for Delivery', time: 'Pending', completed: false },
    { label: 'Delivered', time: 'Pending', completed: false },
  ];

  // Restrict live tracking telemetry (maps) from end-users
  const canViewLiveMap = user?.role && !['Customer', 'BusinessClient'].includes(user.role);

  const defaultRoute: [number, number][] = [
    [19.1136, 72.8697], 
    [19.0760, 72.8777], 
    [19.0330, 72.9268], 
    [18.7562, 73.4072], 
    [18.5913, 73.7389], 
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-navy-500">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Shipment Status</h1>
          <p className="text-navy-500 mt-1">Tracking ID: {id || 'STP-2026-10482'}</p>
        </div>
      </div>

      {canViewLiveMap && (
        <Card className="mb-6 overflow-hidden border-2 border-primary-100">
          <CardHeader className="bg-primary-50 py-3 border-b border-primary-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-primary-800 flex items-center">
              <Truck className="h-4 w-4 mr-2" /> 
              Live Telemetry (Internal View)
            </CardTitle>
            <Badge variant="warning" className="animate-pulse">Live Tracking Active</Badge>
          </CardHeader>
          <div className="w-full">
            <LiveMap route={defaultRoute} driverName="Assigned Driver" />
          </div>
        </Card>
      )}

      {!canViewLiveMap && (
        <div className="bg-warning-50 border border-warning-200 text-warning-800 p-4 rounded-lg flex items-start mb-6">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
          <p className="text-sm">
            <strong>Security Notice:</strong> Detailed live telemetry (GPS mapping) is restricted to operational staff and drivers only for security reasons. The milestone tracker below provides the latest status updates for this shipment.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-navy-100 bg-navy-50/50">
            <div className="flex justify-between items-center">
              <CardTitle>Tracking Details</CardTitle>
              <Badge variant="info">In Transit</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {/* Vertical line connecting timeline dots */}
              <div className="absolute left-4 top-2 bottom-6 w-0.5 bg-navy-200"></div>
              
              <div className="space-y-8">
                {trackingSteps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start">
                    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white
                      ${step.completed ? 'border-primary-500 text-primary-500' : 'border-navy-300 text-navy-300'}`}>
                      {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-navy-300"></div>}
                    </div>
                    <div className="ml-4 mt-1">
                      <p className={`font-semibold ${step.completed ? 'text-navy-900' : 'text-navy-400'}`}>{step.label}</p>
                      <p className="text-sm text-navy-500">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-navy-100 bg-navy-50/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-navy-500">Shipment Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-navy-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-navy-500">Origin</p>
                  <p className="font-medium text-navy-900">Mumbai DC</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-navy-500">Destination</p>
                  <p className="font-medium text-navy-900">Pune Business Park</p>
                </div>
              </div>
              <div className="flex items-start">
                <Package className="h-5 w-5 text-navy-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-navy-500">Package Details</p>
                  <p className="font-medium text-navy-900">2 Pallets (350 kg)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-50 border-primary-100">
            <CardContent className="p-4 flex items-center">
              <Clock className="h-8 w-8 text-primary-500 mr-4" />
              <div>
                <p className="text-sm text-navy-600 font-medium">Estimated Delivery</p>
                <p className="text-xl font-bold text-navy-900">Today, 2:30 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
