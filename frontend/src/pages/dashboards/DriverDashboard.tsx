import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Navigation, CheckCircle, Package, Truck, AlertTriangle, Play, FastForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';

export function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shipments, drivers, updateShipmentStatus } = useDomain();
  
  // For demo, find the driver record that matches the user name or default to DRV-001
  const driverRecord = drivers.find(d => d.email === user?.email) || drivers.find(d => d.name === user?.name) || drivers[0];
  const driverName = driverRecord.name;
  
  const handleNextStatus = (id: string, currentStatus: string) => {
    let nextStatus: any = null;
    if (currentStatus === 'Assigned') nextStatus = 'Picked Up';
    else if (currentStatus === 'Picked Up') nextStatus = 'In Transit';
    else if (currentStatus === 'In Transit') nextStatus = 'Out for Delivery';
    
    if (nextStatus) {
      updateShipmentStatus(id, nextStatus, driverRecord.id, 'Driver App');
    }
  };

  const driverShipments = shipments.filter(s => s.driverId === driverRecord.id);
  const assignedCount = driverShipments.filter(s => ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status)).length;
  const inProgressCount = driverShipments.filter(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status)).length;
  const completedCount = driverShipments.filter(s => s.status === 'Delivered').length;
  const exceptionCount = driverShipments.filter(s => s.status === 'Failed').length;

  const activeShipment = driverShipments.find(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status));
  const upcomingStops = driverShipments.filter(s => s.status === 'Assigned' || s.status === 'Ready for Planning' || s.status === 'Planned');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Driver Dashboard</h1>
        <p className="text-navy-500">Welcome back, {driverName}. Here is your delivery queue for today.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Assigned Today</p>
              <h3 className="text-2xl font-bold text-navy-900">{assignedCount + completedCount}</h3>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-info-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">In Progress</p>
              <h3 className="text-2xl font-bold text-navy-900">{inProgressCount}</h3>
            </div>
            <div className="p-3 bg-info-50 rounded-lg text-info-600">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-navy-900">{completedCount}</h3>
            </div>
            <div className="p-3 bg-success-50 rounded-lg text-success-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-danger-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Exceptions</p>
              <h3 className="text-2xl font-bold text-navy-900">{exceptionCount}</h3>
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
          <h2 className="text-lg font-semibold text-navy-900">Current Assignment</h2>
          {activeShipment ? (
            <Card className="border-primary-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-navy-900">{activeShipment.trackingNumber}</h3>
                    <Badge variant="info" className="ml-2 bg-info-100 text-info-700 hover:bg-info-200">
                      {activeShipment.status}
                    </Badge>
                    <p className="text-sm text-navy-600 mt-1">{activeShipment.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-navy-500">ETA</p>
                    <p className="text-lg font-bold text-primary-600">{activeShipment.eta || 'Pending'}</p>
                  </div>
                </div>
                
                <div className="bg-navy-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Navigation className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Delivery Address</p>
                      <p className="text-sm font-medium text-navy-900 mt-1">{activeShipment.destinationAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1 bg-info-600 hover:bg-info-700 text-white" size="lg" onClick={() => handleNextStatus(activeShipment.id, activeShipment.status)}>
                    <FastForward className="h-5 w-5 mr-2" /> Advance Status
                  </Button>
                  <Button className="flex-1 bg-success-600 hover:bg-success-700 text-white border-0" size="lg" onClick={() => navigate('/pod/signature')} disabled={activeShipment.status !== 'Out for Delivery'}>
                    <CheckCircle className="h-5 w-5 mr-2" /> Mark Delivered
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate(`/shipments/${activeShipment.tracking}`)}>
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-navy-500">
                No active shipments in progress. Select "Start Pickup" on an upcoming stop to begin.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming Stops */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Upcoming Stops</h2>
          <Card>
            <CardContent className="p-0 divide-y divide-navy-100">
              {upcomingStops.length === 0 ? (
                <div className="p-6 text-center text-navy-500">No upcoming stops.</div>
              ) : (
                upcomingStops.map((stop, i) => (
                  <div key={stop.id} className="p-4 hover:bg-navy-50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-navy-900">{stop.trackingNumber}</span>
                      <span className="text-xs font-medium text-navy-500">Stop {i + 1}</span>
                    </div>
                    <p className="text-sm text-navy-600 truncate">{stop.destinationAddress}</p>
                    <p className="text-xs text-navy-400 mt-1">{stop.customerId}</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs py-1 h-7" onClick={() => handleNextStatus(stop.id, stop.status)}>
                        <Play className="h-3 w-3 mr-1" /> Start Pickup
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assigned Shipments Table */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">My Shipments (Today)</h2>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-navy-50 text-navy-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Tracking ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 text-navy-900">
                {driverShipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-navy-500">No shipments assigned today.</td>
                  </tr>
                ) : (
                  driverShipments.map(s => (
                    <tr key={s.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary-600">{s.trackingNumber}</td>
                      <td className="px-6 py-4">{s.customerId}</td>
                      <td className="px-6 py-4">{s.destinationAddress}</td>
                      <td className="px-6 py-4">
                        <Badge variant={s.status === 'Failed' ? 'danger' : s.status === 'Delivered' ? 'success' : (s.status === 'Assigned' || s.status === 'Ready for Planning' || s.status === 'Planned') ? 'warning' : 'info'}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {['Assigned', 'Picked Up', 'In Transit'].includes(s.status) && (
                          <Button size="sm" onClick={() => handleNextStatus(s.id, s.status)}>Advance</Button>
                        )}
                        {(s.status === 'Out for Delivery') && (
                          <Button size="sm" className="bg-success-600 hover:bg-success-700 text-white" onClick={() => navigate('/pod/signature')}>Deliver</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/shipments/${s.trackingNumber}`)}>View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
