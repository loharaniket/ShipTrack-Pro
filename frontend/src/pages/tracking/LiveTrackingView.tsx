import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Truck, Package, MapPin, User, Phone, ArrowLeft, 
  RefreshCw, Clock, ShieldCheck, AlertTriangle, CheckCircle2, Navigation 
} from 'lucide-react';
import { liveTrackingService, DriverLocationDto } from '@/services/liveTrackingService';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';
import { addressService } from '@/services/addressService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { LiveMap } from '@/components/maps/LiveMap';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';

export function LiveTrackingView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<CustomerShipmentItem | null>(null);
  const [tracking, setTracking] = useState<DriverLocationDto | null>(null);
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>(undefined);
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
      // Auto-poll live driver location every 5 seconds
      const interval = setInterval(() => {
        pollLocation(id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const loadData = async (shipmentId: string) => {
    try {
      setLoading(true);
      setError('');
      const [shipmentData, trackingData] = await Promise.all([
        shipmentService.getShipmentById(shipmentId),
        liveTrackingService.getShipmentLiveLocation(shipmentId).catch(() => null)
      ]);
      setShipment(shipmentData);
      setTracking(trackingData);

      // Resolve Dynamic Coordinates based on shipment addresses
      await resolveCoordinates(shipmentData);
    } catch (err: any) {
      setError(err.message || 'Failed to load live tracking details');
    } finally {
      setLoading(false);
    }
  };

  const resolveCoordinates = async (s: CustomerShipmentItem) => {
    // 1. Origin Coordinates
    if (s.originAddress?.latitude && s.originAddress?.longitude) {
      setOriginCoords([Number(s.originAddress.latitude), Number(s.originAddress.longitude)]);
    } else if (s.pickupAddress && s.pickupAddress.trim()) {
      const geo = await addressService.geocodeAddress(s.pickupAddress);
      if (geo) {
        setOriginCoords([geo.latitude, geo.longitude]);
      }
    }

    // 2. Destination Coordinates
    if (s.destinationAddress?.latitude && s.destinationAddress?.longitude) {
      setDestCoords([Number(s.destinationAddress.latitude), Number(s.destinationAddress.longitude)]);
    } else if (s.deliveryAddress && s.deliveryAddress.trim()) {
      const geo = await addressService.geocodeAddress(s.deliveryAddress);
      if (geo) {
        setDestCoords([geo.latitude, geo.longitude]);
      }
    }
  };

  const pollLocation = async (shipmentId: string) => {
    try {
      const data = await liveTrackingService.getShipmentLiveLocation(shipmentId);
      setTracking(data);
    } catch (e) {
      // Background poll silently continues
    }
  };

  const handleManualRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    await loadData(id);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-navy-400">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        Connecting to live tracking telemetry...
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Live Tracking Unavailable</h2>
        <p className="text-sm text-navy-500">{error || 'Could not find shipment or active tracking session.'}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const driverCoords: [number, number] | undefined =
    tracking && tracking.latitude && tracking.longitude
      ? [Number(tracking.latitude), Number(tracking.longitude)]
      : undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-navy-100 hover:bg-navy-50 text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">Live Driver Tracking</h1>
              {tracking?.status === 'ACTIVE' ? (
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Live GPS Streaming
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-navy-50 text-navy-600 text-xs px-2.5 py-0.5 rounded-full font-medium border border-navy-200">
                  Route Map
                </span>
              )}
            </div>
            <p className="text-xs text-navy-500 font-mono mt-0.5">
              Shipment {shipment.trackingNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <ShipmentStatusBadge status={shipment.status} />
        </div>
      </div>

      {/* Dynamic Live Map Display */}
      <Card className="overflow-hidden border border-navy-200">
        <CardContent className="p-0">
          <LiveMap
            originPosition={originCoords}
            destinationPosition={destCoords}
            driverPosition={driverCoords}
            originAddress={shipment.pickupAddress}
            destinationAddress={shipment.deliveryAddress}
            driverName={tracking?.driverName || 'Courier Driver'}
            accuracy={tracking?.accuracy}
            connectionStatus={tracking?.connectionStatus || 'CONNECTED'}
            height="h-[420px]"
          />
        </CardContent>
      </Card>

      {/* Live Telemetry and Courier Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Driver Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary-500" /> Assigned Courier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                {(tracking?.driverName || 'Driver').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-navy-900 text-sm">{tracking?.driverName || 'Driver Assigned'}</p>
                <p className="text-navy-500">{tracking?.driverPhone || 'Contact available upon dispatch'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-100 space-y-1.5 text-navy-600">
              <div className="flex justify-between">
                <span>GPS Telemetry Status:</span>
                <span className="font-semibold text-emerald-600">
                  {tracking?.status === 'ACTIVE' ? 'Broadcasting (Live)' : 'Awaiting Next Ping'}
                </span>
              </div>
              {tracking?.lastPingAt && (
                <div className="flex justify-between">
                  <span>Last Location Ping:</span>
                  <span className="font-mono text-navy-800">{formatRelativeTime(tracking.lastPingAt)}</span>
                </div>
              )}
              {tracking?.accuracy && (
                <div className="flex justify-between">
                  <span>GPS Precision:</span>
                  <span className="font-mono text-navy-800">~{Math.round(tracking.accuracy)} meters</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Route Details Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary-500" /> Delivery Route Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pickup Origin
                </div>
                <p className="font-medium text-navy-800">{shipment.pickupAddress}</p>
                {originCoords && (
                  <p className="text-[11px] font-mono text-emerald-700 mt-1">
                    Coords: {originCoords[0].toFixed(4)}, {originCoords[1].toFixed(4)}
                  </p>
                )}
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Destination
                </div>
                <p className="font-medium text-navy-800">{shipment.deliveryAddress}</p>
                {destCoords && (
                  <p className="text-[11px] font-mono text-rose-700 mt-1">
                    Coords: {destCoords[0].toFixed(4)}, {destCoords[1].toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-navy-500 border-t border-navy-100 pt-3">
              <div>
                Receiver: <strong className="text-navy-800">{shipment.receiverName}</strong> ({shipment.receiverPhone || 'N/A'})
              </div>
              <div>
                Package Weight: <strong className="text-navy-800">{shipment.weight} kg</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
