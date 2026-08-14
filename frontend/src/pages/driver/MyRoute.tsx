import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Navigation, FastForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';

export function MyRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { routes, routeStops, shipments, drivers, vehicles, updateShipmentStatus } = useDomain();
  
  const driverRecord = drivers.find(d => d.email === user?.email) || drivers.find(d => d.name === user?.name) || drivers[0];
  
  const handleNextStatus = (id: string, currentStatus: string) => {
    let nextStatus: any = null;
    if (currentStatus === 'Assigned' || currentStatus === 'Planned') nextStatus = 'Picked Up';
    else if (currentStatus === 'Picked Up') nextStatus = 'In Transit';
    else if (currentStatus === 'In Transit') nextStatus = 'Out for Delivery';
    
    if (nextStatus) {
      updateShipmentStatus(id, nextStatus, driverRecord.id, 'Driver App');
    }
  };
  
  // Get active route for driver
  const activeRoute = routes.find(r => r.driverId === driverRecord.id && r.status !== 'Completed');
  const routeId = activeRoute ? activeRoute.id : 'N/A';
  
  // Get shipments in order of route stops
  const routeShipments = activeRoute 
    ? routeStops.filter(s => s.routeId === activeRoute.id).sort((a,b) => a.sequence - b.sequence).map(stop => shipments.find(s => s.id === stop.shipmentId)).filter(Boolean) as any[]
    : [];
  
  const vehicleObj = activeRoute ? vehicles.find(v => v.id === activeRoute.vehicleId) : null;
  const vehicle = vehicleObj ? `${vehicleObj.registration} (${vehicleObj.type})` : 'N/A';
  
  const totalStops = routeShipments.length;
  const completedStops = routeShipments.filter(s => s.status === 'Delivered').length;
  const progress = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
  
  const isRouteActive = routeShipments.some(s => s.status === 'Picked Up' || s.status === 'In Transit' || s.status === 'Out for Delivery');

  if (routeShipments.length === 0) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-navy-900">My Route</h1>
        <Card className="text-center p-12 bg-navy-50 border-dashed border-2 border-navy-200">
          <CardContent>
             <h3 className="text-lg font-bold text-navy-900">No Active Route</h3>
             <p className="text-navy-500 mt-2">You don't have any active routes assigned at the moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Route</h1>
          <p className="text-navy-500 mt-1">Route Execution Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle className="text-lg">Route Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-navy-500">Route ID</p>
                <p className="font-bold text-navy-900 text-lg">{routeId}</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-navy-500">Status</p>
                  <Badge variant={isRouteActive ? 'info' : 'success'}>{isRouteActive ? 'In Progress' : 'Completed'}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-navy-500">Vehicle</p>
                  <p className="font-medium text-navy-900">{vehicle}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-navy-900">Progress</span>
                  <span className="font-bold text-primary-600">{completedStops} / {totalStops} Stops</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle className="text-lg">Stops</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-navy-100">
                {routeShipments.map((shipment, index) => {
                  const isCompleted = shipment.status === 'Delivered';
                  const isCurrent = ['Picked Up', 'In Transit', 'Out for Delivery'].includes(shipment.status);
                  const isUpcoming = !isCompleted && !isCurrent;
                  const canAdvance = ['Assigned', 'Picked Up', 'In Transit'].includes(shipment.status);
                  
                  return (
                    <div 
                      key={shipment.id}
                      className={`p-4 flex items-start gap-4 ${isCompleted ? 'bg-success-50/50' : isCurrent ? 'border-l-4 border-primary-500 bg-primary-50/30' : 'opacity-75'}`}
                    >
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-success-500" />
                        ) : isCurrent ? (
                          <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs border-2 border-primary-500">
                            {index + 1}
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-navy-100 text-navy-500 flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            {isCurrent && <Badge className="mb-2" variant="info">Current Stop</Badge>}
                            <h4 className="font-bold text-navy-900">{shipment.customerId} ({shipment.trackingNumber})</h4>
                          </div>
                          <Badge variant={isCompleted ? 'success' : isCurrent ? 'default' : 'outline'}>
                            {isCompleted ? 'Completed' : isUpcoming ? 'Upcoming' : shipment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-navy-600 mb-3">{shipment.destinationAddress}</p>
                        
                        {(isCurrent || isUpcoming) && (
                          <div className="flex space-x-3 mt-4">
                            {canAdvance && (
                              <Button size="sm" onClick={() => handleNextStatus(shipment.id, shipment.status)}>
                                <FastForward className="h-4 w-4 mr-2" /> Advance Status
                              </Button>
                            )}
                            {shipment.status === 'Out for Delivery' && (
                              <Button size="sm" className="bg-success-600 hover:bg-success-700 text-white" onClick={() => navigate('/pod/signature')}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Deliver
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => navigate(`/shipments/${shipment.trackingNumber}`)}>
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
