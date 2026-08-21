import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Navigation, Radio, RefreshCw, AlertCircle, 
  MapPin, Phone, User, Package, ExternalLink, Clock 
} from 'lucide-react';
import { liveTrackingService, ActiveDriverTrackingDto } from '@/services/liveTrackingService';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';
import { addressService } from '@/services/addressService';
import { LiveMap } from '@/components/maps/LiveMap';
import { formatRelativeTime } from '@/utils/dateFormatter';

export function LiveFleetTracking() {
  const navigate = useNavigate();

  const [activeDrivers, setActiveDrivers] = useState<ActiveDriverTrackingDto[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<ActiveDriverTrackingDto | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<CustomerShipmentItem | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>(undefined);
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActiveDrivers();
    const interval = setInterval(pollActiveDrivers, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDriver?.shipmentId) {
      loadShipmentDetails(selectedDriver.shipmentId, selectedDriver.deliveryAddress);
    } else {
      setSelectedShipment(null);
      setDestCoords(undefined);
      setOriginCoords(undefined);
    }
  }, [selectedDriver?.shipmentId]);

  const loadShipmentDetails = async (shipmentId: string, deliveryAddressFallback?: string) => {
    try {
      const s = await shipmentService.getShipmentById(shipmentId);
      setSelectedShipment(s);

      // Origin Coords
      if (s.originAddress?.latitude && s.originAddress?.longitude) {
        setOriginCoords([Number(s.originAddress.latitude), Number(s.originAddress.longitude)]);
      } else if (s.pickupAddress) {
        const geo = await addressService.geocodeAddress(s.pickupAddress);
        if (geo) setOriginCoords([geo.latitude, geo.longitude]);
      }

      // Destination Coords
      if (s.destinationAddress?.latitude && s.destinationAddress?.longitude) {
        setDestCoords([Number(s.destinationAddress.latitude), Number(s.destinationAddress.longitude)]);
      } else if (s.deliveryAddress || deliveryAddressFallback) {
        const geo = await addressService.geocodeAddress(s.deliveryAddress || deliveryAddressFallback || '');
        if (geo) setDestCoords([geo.latitude, geo.longitude]);
      }
    } catch (e) {
      // Fallback geocode directly from driver deliveryAddress
      if (deliveryAddressFallback) {
        const geo = await addressService.geocodeAddress(deliveryAddressFallback);
        if (geo) setDestCoords([geo.latitude, geo.longitude]);
      }
    }
  };

  const loadActiveDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await liveTrackingService.getActiveDrivers();
      setActiveDrivers(data || []);
      if (data && data.length > 0 && !selectedDriver) {
        setSelectedDriver(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load active drivers fleet');
    } finally {
      setLoading(false);
    }
  };

  const pollActiveDrivers = async () => {
    try {
      const data = await liveTrackingService.getActiveDrivers();
      setActiveDrivers(data || []);
      if (selectedDriver) {
        const updated = data.find(d => d.trackingId === selectedDriver.trackingId);
        if (updated) setSelectedDriver(updated);
      }
    } catch (e) {
      // Background poll
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadActiveDrivers();
    if (selectedDriver?.shipmentId) {
      await loadShipmentDetails(selectedDriver.shipmentId, selectedDriver.deliveryAddress);
    }
    setRefreshing(false);
  };

  const driverCoords: [number, number] | undefined =
    selectedDriver && selectedDriver.latitude && selectedDriver.longitude
      ? [Number(selectedDriver.latitude), Number(selectedDriver.longitude)]
      : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">Live Fleet & Delivery Supervision</h1>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              {activeDrivers.length} Active {activeDrivers.length === 1 ? 'Courier' : 'Couriers'}
            </span>
          </div>
          <p className="text-sm text-navy-500 mt-1">
            Real-time GPS telemetry and delivery progress across all on-duty drivers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-navy-400">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          Connecting to live telemetry feed...
        </div>
      ) : activeDrivers.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <Truck className="h-12 w-12 text-navy-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-900">No Active Drivers Broadcasting</h3>
            <p className="text-sm text-navy-500 mt-1">
              Currently there are no couriers with active OUT_FOR_DELIVERY sessions streaming GPS coordinates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Couriers List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-navy-500 tracking-wider">
              Active Courier Sessions ({activeDrivers.length})
            </h3>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {activeDrivers.map((driver) => {
                const isSelected = selectedDriver?.trackingId === driver.trackingId;

                return (
                  <div
                    key={driver.trackingId}
                    onClick={() => setSelectedDriver(driver)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/50 shadow-sm ring-1 ring-primary-500'
                        : 'border-navy-200 bg-white hover:border-navy-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                          {driver.driverName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-navy-900 text-sm">{driver.driverName}</p>
                          <p className="text-xs text-navy-500">{driver.driverPhone || driver.driverEmail}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Live
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-navy-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-navy-600">
                        <span>Shipment:</span>
                        <strong className="text-primary-600 font-mono">{driver.trackingNumber}</strong>
                      </div>
                      <div className="flex items-center justify-between text-navy-500">
                        <span>Receiver:</span>
                        <span className="truncate max-w-[140px]">{driver.receiverName}</span>
                      </div>
                      <div className="text-[11px] text-navy-400 truncate">
                        📍 {driver.deliveryAddress}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map & Live Courier Telemetry View */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDriver && (
              <>
                <Card className="overflow-hidden border border-navy-200">
                  <CardHeader className="py-3 px-4 bg-navy-50/70 border-b border-navy-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
                      <CardTitle className="text-sm font-bold text-navy-900">
                        {selectedDriver.driverName} — Live Telemetry (Shipment {selectedDriver.trackingNumber})
                      </CardTitle>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/shipments/${selectedDriver.shipmentId}/live-tracking`)}
                      className="h-7 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" /> Dedicated View
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <LiveMap
                      originPosition={originCoords}
                      destinationPosition={destCoords}
                      driverPosition={driverCoords}
                      originAddress={selectedShipment?.pickupAddress}
                      destinationAddress={selectedDriver.deliveryAddress}
                      driverName={selectedDriver.driverName}
                      accuracy={selectedDriver.accuracy}
                      connectionStatus={selectedDriver.connectionStatus}
                      height="h-[460px]"
                    />
                  </CardContent>
                </Card>

                {/* Telemetry metadata footer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-navy-100">
                    <span className="text-navy-400 font-semibold uppercase text-[10px]">Driver Contact</span>
                    <p className="font-medium text-navy-900 mt-0.5">{selectedDriver.driverPhone || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-navy-100">
                    <span className="text-navy-400 font-semibold uppercase text-[10px]">Coordinates</span>
                    <p className="font-mono text-navy-900 mt-0.5">
                      {selectedDriver.latitude?.toFixed(4)}, {selectedDriver.longitude?.toFixed(4)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-navy-100">
                    <span className="text-navy-400 font-semibold uppercase text-[10px]">GPS Accuracy</span>
                    <p className="font-mono text-navy-900 mt-0.5">
                      ~{Math.round(selectedDriver.accuracy || 0)} meters
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-navy-100">
                    <span className="text-navy-400 font-semibold uppercase text-[10px]">Telemetry Ping</span>
                    <p className="font-medium text-emerald-600 mt-0.5">
                      {formatRelativeTime(selectedDriver.lastPingAt)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
