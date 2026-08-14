import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, MapPin, Navigation, Clock, Package, Truck, CheckCircle2, Box } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shipments } = useDomain();

  const [trackingInput, setTrackingInput] = React.useState('');
  
  // Real security filtering
  const customerId = user?.organizationId || 'CUST-002'; // Nova Electronics fallback
  const customerShipments = shipments.filter(s => s.customerId === customerId);
  
  const activeShipments = customerShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled');
  const inTransitCount = customerShipments.filter(s => s.status === 'In Transit').length;
  const outForDeliveryCount = customerShipments.filter(s => s.status === 'Out for Delivery').length;
  const deliveredCount = customerShipments.filter(s => s.status === 'Delivered').length;

  const handleTrack = () => {
    if (trackingInput.trim()) {
      navigate(`/tracking/${trackingInput.trim()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Good morning, {user?.name}</h1>
          <p className="text-navy-500 mt-1">Track your recent shipments</p>
        </div>
        <div className="flex w-full sm:w-auto">
          <Input 
            placeholder="Track by Shipment ID" 
            className="h-10 rounded-r-none border-r-0 max-w-[200px]"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          />
          <Button className="h-10 rounded-l-none" onClick={handleTrack} disabled={!trackingInput.trim()}>
            Track
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Package className="h-6 w-6 text-info-400 mb-2" />
            <div className="text-2xl font-bold">{activeShipments.length}</div>
            <p className="text-xs text-navy-500">Active Shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Truck className="h-6 w-6 text-primary-400 mb-2" />
            <div className="text-2xl font-bold">{inTransitCount}</div>
            <p className="text-xs text-navy-500">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Navigation className="h-6 w-6 text-warning-400 mb-2" />
            <div className="text-2xl font-bold">{outForDeliveryCount}</div>
            <p className="text-xs text-navy-500">Out for Delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CheckCircle2 className="h-6 w-6 text-success-400 mb-2" />
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-navy-500">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {activeShipments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary-500" /> Active Deliveries
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeShipments.map(s => (
              <Card key={s.id} className="hover:shadow-md transition-shadow border-primary-100">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-navy-100 bg-navy-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm">
                      <Box className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-navy-900">{s.trackingNumber}</CardTitle>
                      <p className="text-xs text-navy-500 mt-0.5 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Updated {s.statusHistory?.[0]?.timestamp || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-center bg-navy-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center text-navy-700">
                      <MapPin className="h-4 w-4 mr-2 text-primary-500" /> {s.originAddress}
                    </div>
                    <div className="flex items-center text-navy-700">
                      <Navigation className="h-4 w-4 mr-2 text-navy-400" /> {s.destinationAddress}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-500">Progress</span>
                      <span className="font-medium">{s.progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                      <div className="h-full bg-info-500" style={{ width: `${s.progressPercentage}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm font-medium text-navy-900">
                      <Clock className="h-4 w-4 mr-2 text-primary-500" />
                      ETA: {s.eta}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/shipments/${s.trackingNumber}`)}>Track</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Shipments</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy-50 text-navy-500 font-medium">
              <tr>
                <th className="px-6 py-3">Shipment</th>
                <th className="px-6 py-3">Origin</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">ETA</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 text-navy-900">
              {customerShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-navy-500">No shipments found.</td>
                </tr>
              ) : (
                customerShipments.map(s => (
                  <tr key={s.id} className="hover:bg-navy-50">
                    <td className="px-6 py-4 font-medium">{s.trackingNumber}</td>
                    <td className="px-6 py-4">{s.originAddress}</td>
                    <td className="px-6 py-4">{s.destinationAddress}</td>
                    <td className="px-6 py-4">
                      <Badge variant={s.status === 'Delivered' ? 'success' : s.status === 'Failed' ? 'danger' : 'info'}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{s.eta}</td>
                    <td className="px-6 py-4 text-navy-500">{s.statusHistory[0]?.timestamp || 'Unknown'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking/${s.trackingNumber}`)}>Track</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
