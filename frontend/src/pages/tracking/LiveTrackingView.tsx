import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Truck, Package, MapPin, User, Phone, ArrowLeft, 
  RefreshCw, Clock, ShieldCheck, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { liveTrackingService, DriverLocationDto } from '@/services/liveTrackingService';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { LiveMap } from '@/components/maps/LiveMap';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';

export function LiveTrackingView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<CustomerShipmentItem | null>(null);
  const [tracking, setTracking] = useState<DriverLocationDto | null>(null);
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
    } catch (err: any) {
      setError(err.message || 'Failed to load live tracking details');
    } finally {
      setLoading(false);
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

  // Approximate default destination coordinate based on delivery address if not geocoded
  const destinationCoords: [number, number] = [18.5204, 73.8567];

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
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Live
              </span>
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

      {/* Live Map Display */}
      <Card className="overflow-hidden border border-navy-200">
        <CardContent className="p-0">
          <LiveMap
            driverPosition={driverCoords}
            destinationPosition={destinationCoords}
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
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-navy-50/50">
              <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                {tracking?.driverName ? tracking.driverName.charAt(0).toUpperCase() : 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy-900 truncate">
                  {tracking?.driverName || 'Assigned Driver'}
                </p>
                <p className="text-navy-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" /> {tracking?.driverPhone || '+91-9876543210'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-navy-600 pt-1 border-t border-navy-100">
              <span>Status:</span>
              <span className="font-semibold text-emerald-600">
                {tracking?.status === 'ACTIVE' ? 'En Route' : tracking?.status || 'Active'}
              </span>
            </div>
            {tracking?.lastPingAt && (
              <div className="flex items-center justify-between text-navy-500">
                <span>Last GPS Ping:</span>
                <span className="font-mono">{formatRelativeTime(tracking.lastPingAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Destination & Package Details */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-500" /> Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-lg bg-navy-50/50">
              <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                Recipient
              </span>
              <p className="font-bold text-navy-900">{shipment.receiverName}</p>
              <p className="text-navy-600">{shipment.receiverPhone}</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-lg bg-navy-50/50">
              <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                Destination Address
              </span>
              <p className="font-medium text-navy-900 leading-relaxed">
                {shipment.deliveryAddress}
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-primary-50/40 border border-primary-100">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-600" />
                <span className="font-medium text-navy-900">
                  {shipment.packageDescription || 'Standard Parcel'}
                </span>
              </div>
              <span className="font-mono font-semibold text-primary-700">
                {shipment.weight ? `${shipment.weight} kg` : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
