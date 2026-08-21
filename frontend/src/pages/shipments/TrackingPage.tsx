import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, MapPin, CheckCircle2, Clock, Truck, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { LiveMap } from '@/components/maps/LiveMap';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';
import { liveTrackingService, DriverLocationDto } from '@/services/liveTrackingService';
import { addressService } from '@/services/addressService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function TrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shipment, setShipment] = useState<CustomerShipmentItem | null>(null);
  const [liveLocation, setLiveLocation] = useState<DriverLocationDto | null>(null);
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>(undefined);
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadShipment(id);
    }
  }, [id]);

  const loadShipment = async (shipmentId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await shipmentService.getShipmentById(shipmentId);
      setShipment(data);

      // Check live location
      try {
        const live = await liveTrackingService.getShipmentLiveLocation(shipmentId);
        setLiveLocation(live);
      } catch (e) {
        // No active live tracking session
      }

      // Resolve Origin Coords
      if (data.originAddress?.latitude && data.originAddress?.longitude) {
        setOriginCoords([Number(data.originAddress.latitude), Number(data.originAddress.longitude)]);
      } else if (data.pickupAddress) {
        const geo = await addressService.geocodeAddress(data.pickupAddress);
        if (geo) setOriginCoords([geo.latitude, geo.longitude]);
      }

      // Resolve Destination Coords
      if (data.destinationAddress?.latitude && data.destinationAddress?.longitude) {
        setDestCoords([Number(data.destinationAddress.latitude), Number(data.destinationAddress.longitude)]);
      } else if (data.deliveryAddress) {
        const geo = await addressService.geocodeAddress(data.deliveryAddress);
        if (geo) setDestCoords([geo.latitude, geo.longitude]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const driverCoords: [number, number] | undefined =
    liveLocation?.latitude && liveLocation?.longitude
      ? [Number(liveLocation.latitude), Number(liveLocation.longitude)]
      : undefined;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-navy-500">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Shipment Status</h1>
          <p className="text-navy-500 mt-1">
            Tracking ID: <span className="font-mono font-bold text-primary-600">{shipment?.trackingNumber || id}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-navy-400">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          Loading shipment status...
        </div>
      ) : shipment ? (
        <>
          {/* Dynamic Geocoded Live Map */}
          {(originCoords || destCoords || driverCoords) && (
            <Card className="mb-6 overflow-hidden border-2 border-primary-100">
              <CardHeader className="bg-primary-50 py-3 border-b border-primary-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-primary-800 flex items-center">
                  <Truck className="h-4 w-4 mr-2" /> 
                  Dynamic Route Map
                </CardTitle>
                <ShipmentStatusBadge status={shipment.status} />
              </CardHeader>
              <div className="w-full">
                <LiveMap
                  originPosition={originCoords}
                  destinationPosition={destCoords}
                  driverPosition={driverCoords}
                  originAddress={shipment.pickupAddress}
                  destinationAddress={shipment.deliveryAddress}
                  driverName={liveLocation?.driverName || 'Assigned Courier'}
                  accuracy={liveLocation?.accuracy}
                  connectionStatus={liveLocation?.connectionStatus || 'CONNECTED'}
                  height="h-80"
                />
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-navy-100 bg-navy-50/50">
                <div className="flex justify-between items-center">
                  <CardTitle>Milestone Progress</CardTitle>
                  <ShipmentStatusBadge status={shipment.status} />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {shipment.timeline && shipment.timeline.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-200">
                    {shipment.timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-white border-2 border-primary-600 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ShipmentStatusBadge status={event.status} />
                            <span className="text-xs text-navy-400 font-mono">
                              {formatFriendlyDate(event.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-navy-800">{event.description}</p>
                          {event.location && (
                            <p className="text-xs text-navy-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-navy-500 text-center py-6">Milestone updates in progress.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 border-b border-navy-100 bg-navy-50/50">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-navy-500">Shipment Info</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-emerald-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-navy-500">Pickup Origin</p>
                      <p className="font-medium text-navy-900">{shipment.pickupAddress}</p>
                      {originCoords && (
                        <p className="text-[10px] font-mono text-emerald-700">
                          {originCoords[0].toFixed(4)}, {originCoords[1].toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-rose-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-navy-500">Delivery Destination</p>
                      <p className="font-medium text-navy-900">{shipment.deliveryAddress}</p>
                      {destCoords && (
                        <p className="text-[10px] font-mono text-rose-700">
                          {destCoords[0].toFixed(4)}, {destCoords[1].toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Package className="h-5 w-5 text-navy-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-navy-500">Package Details</p>
                      <p className="font-medium text-navy-900">{shipment.packageDescription || 'General Package'} ({shipment.weight} kg)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary-50 border-primary-100">
                <CardContent className="p-4 flex items-center">
                  <Clock className="h-8 w-8 text-primary-500 mr-4" />
                  <div>
                    <p className="text-sm text-navy-600 font-medium">Created On</p>
                    <p className="text-sm font-bold text-navy-900">{formatFriendlyDate(shipment.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
