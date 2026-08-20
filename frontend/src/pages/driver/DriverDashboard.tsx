import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, Package, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  MapPin, Phone, Camera, ArrowRight, UploadCloud, Check, User,
  Navigation, Radio, StopCircle, PlayCircle, ExternalLink, ShieldCheck
} from 'lucide-react';
import { driverService } from '@/services/driverService';
import { liveTrackingService, DriverLocationDto } from '@/services/liveTrackingService';
import { CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';
import { useAuth } from '@/context/AuthContext';

export function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState<CustomerShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live GPS Tracking State
  const [activeTrackingSession, setActiveTrackingSession] = useState<DriverLocationDto | null>(null);
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const geoWatchIdRef = useRef<number | null>(null);

  // Status Update Modal State
  const [statusModalShipment, setStatusModalShipment] = useState<CustomerShipmentItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY'>('PICKED_UP');
  const [statusDescription, setStatusDescription] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  // POD Upload Modal State
  const [podModalShipment, setPodModalShipment] = useState<CustomerShipmentItem | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPod, setIsUploadingPod] = useState(false);
  const [podError, setPodError] = useState('');

  useEffect(() => {
    loadDeliveries();
    return () => {
      stopGeolocationWatcher();
    };
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await driverService.getAssignedDeliveries();
      setDeliveries(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  const startGeolocationWatcher = (shipmentId: string) => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsBroadcastingGps(true);

    const sendPosition = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy;
      setLastCoords({ lat, lng, accuracy: acc });

      try {
        await liveTrackingService.updateLocation(shipmentId, lat, lng, acc);
      } catch (e) {
        console.warn('Live location update failed:', e);
      }
    };

    // Immediate fix
    navigator.geolocation.getCurrentPosition(
      sendPosition,
      (err) => console.warn('Geo current error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Continuous watch
    const watchId = navigator.geolocation.watchPosition(
      sendPosition,
      (err) => console.warn('Geo watch error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    geoWatchIdRef.current = watchId;
  };

  const stopGeolocationWatcher = () => {
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    setIsBroadcastingGps(false);
  };

  const handleStartTracking = async (shipment: CustomerShipmentItem) => {
    try {
      setTrackingLoading(true);
      setError('');
      const session = await liveTrackingService.startTracking(shipment.id);
      setActiveTrackingSession(session);
      startGeolocationWatcher(shipment.id);
      setSuccessMsg(`Live tracking activated for shipment ${shipment.trackingNumber}! Broadcasting GPS.`);
      await loadDeliveries();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to start live tracking session');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleStopTracking = async (shipmentId: string) => {
    try {
      setTrackingLoading(true);
      setError('');
      await liveTrackingService.stopTracking(shipmentId, 'COMPLETED');
      stopGeolocationWatcher();
      setActiveTrackingSession(null);
      setSuccessMsg('Live tracking session stopped.');
      await loadDeliveries();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to stop live tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  const getNextStatusSuggestion = (currentStatus: string): { status: 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY'; label: string; desc: string } | null => {
    const s = (currentStatus || '').toUpperCase();
    if (s === 'ASSIGNED') {
      return { status: 'PICKED_UP', label: 'Mark Picked Up', desc: 'Package picked up from origin/hub' };
    }
    if (s === 'PICKED_UP') {
      return { status: 'IN_TRANSIT', label: 'Mark In Transit', desc: 'Package is in transit towards delivery address' };
    }
    if (s === 'IN_TRANSIT') {
      return { status: 'OUT_FOR_DELIVERY', label: 'Mark Out for Delivery', desc: 'Out for final delivery with courier' };
    }
    return null;
  };

  const handleOpenStatusModal = (shipment: CustomerShipmentItem) => {
    const next = getNextStatusSuggestion(shipment.status);
    if (next) {
      setStatusModalShipment(shipment);
      setTargetStatus(next.status);
      setStatusDescription(next.desc);
      setStatusError('');
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModalShipment) return;

    setIsUpdatingStatus(true);
    setStatusError('');

    try {
      await driverService.updateShipmentStatus(
        statusModalShipment.id,
        targetStatus,
        statusDescription.trim() || `Status updated to ${targetStatus}`
      );

      setSuccessMsg(`Shipment ${statusModalShipment.trackingNumber} status updated to ${targetStatus}!`);
      setStatusModalShipment(null);
      await loadDeliveries();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update shipment status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenPodModal = (shipment: CustomerShipmentItem) => {
    setPodModalShipment(shipment);
    setReceiverName(shipment.receiverName || '');
    setPhotoFile(null);
    setPhotoPreview(null);
    setPodError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPodError('Photo exceeds 5MB size limit.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPodError('');
    }
  };

  const handleConfirmPodUpload = async () => {
    if (!podModalShipment) return;
    if (!receiverName.trim()) {
      setPodError('Please provide the receiver/signee name.');
      return;
    }
    if (!photoFile) {
      setPodError('Please attach a proof of delivery photo (.jpg, .png, .webp).');
      return;
    }

    setIsUploadingPod(true);
    setPodError('');

    try {
      await driverService.uploadPod(podModalShipment.id, receiverName.trim(), photoFile);
      // Auto-stop GPS watcher on POD completion
      stopGeolocationWatcher();
      setActiveTrackingSession(null);
      setSuccessMsg(`Delivery completed! POD uploaded for shipment ${podModalShipment.trackingNumber}.`);
      setPodModalShipment(null);
      await loadDeliveries();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setPodError(err.message || 'Failed to upload POD photo. Please try again.');
    } finally {
      setIsUploadingPod(false);
    }
  };

  const totalAssigned = deliveries.length;
  const inProgressCount = deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length;
  const activeOutForDelivery = deliveries.find(d => d.status === 'OUT_FOR_DELIVERY');
  const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Courier Delivery Dashboard</h1>
          <p className="text-sm text-navy-500 mt-1">
            Welcome back, {user?.name || 'Driver'}. Manage your assigned delivery routes, live GPS telemetry, and proof of deliveries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadDeliveries} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-sm shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE LIVE DELIVERY TRACKING BANNER */}
      {activeOutForDelivery && (
        <div className="bg-gradient-to-r from-primary-900 to-navy-900 text-white rounded-2xl p-5 shadow-lg border border-primary-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Active Delivery
              </span>
              {isBroadcastingGps ? (
                <span className="flex items-center gap-1 bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-sky-500/40">
                  <Radio className="h-3 w-3 animate-pulse" /> GPS Streaming
                </span>
              ) : (
                <span className="text-xs text-navy-300">GPS Inactive</span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Shipment {activeOutForDelivery.trackingNumber}
              </h3>
              <p className="text-xs text-navy-200 mt-0.5">
                Delivering to: <strong className="text-white">{activeOutForDelivery.receiverName}</strong> ({activeOutForDelivery.deliveryAddress})
              </p>
              {lastCoords && (
                <p className="text-[11px] font-mono text-emerald-300 mt-1">
                  GPS: {lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)} (~{Math.round(lastCoords.accuracy || 0)}m accuracy)
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isBroadcastingGps ? (
              <Button
                onClick={() => handleStartTracking(activeOutForDelivery)}
                disabled={trackingLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                <PlayCircle className="h-4 w-4 mr-2" /> Start GPS Broadcast
              </Button>
            ) : (
              <Button
                onClick={() => handleStopTracking(activeOutForDelivery.id)}
                disabled={trackingLoading}
                variant="outline"
                className="border-rose-400 text-rose-300 hover:bg-rose-950/40"
              >
                <StopCircle className="h-4 w-4 mr-2" /> Stop GPS
              </Button>
            )}

            <Button
              onClick={() => navigate(`/shipments/${activeOutForDelivery.id}/live-tracking`)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Live Map
            </Button>

            <Button
              onClick={() => handleOpenPodModal(activeOutForDelivery)}
              className="bg-primary-500 hover:bg-primary-400 text-white font-bold"
            >
              <Camera className="h-4 w-4 mr-2" /> Complete POD
            </Button>
          </div>
        </div>
      )}

      {/* Driver Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-navy-500 tracking-wider">Assigned Total</p>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">{loading ? '...' : totalAssigned}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-navy-500 tracking-wider">In Progress</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{loading ? '...' : inProgressCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-navy-500 tracking-wider">Out for Delivery</p>
              <p className="text-2xl font-extrabold text-primary-600 mt-1">
                {loading ? '...' : deliveries.filter(d => d.status === 'OUT_FOR_DELIVERY').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Navigation className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-navy-500 tracking-wider">Delivered</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{loading ? '...' : deliveredCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Queue */}
      <Card>
        <CardHeader className="py-4 border-b border-navy-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-navy-900">Assigned Deliveries Queue</CardTitle>
            <p className="text-xs text-navy-500 mt-0.5">Progress shipment statuses, stream GPS telemetry, or capture POD to finalize delivery</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading delivery roster...</div>
          ) : deliveries.length === 0 ? (
            <div className="p-16 text-center">
              <Truck className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Assigned Deliveries</h3>
              <p className="text-sm text-navy-500 mt-1">
                You currently have no pending deliveries assigned by dispatch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Tracking Number</th>
                    <th className="px-6 py-3.5">Recipient & Contact</th>
                    <th className="px-6 py-3.5">Pickup → Destination</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Workflow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {deliveries.map((delivery) => {
                    const nextStep = getNextStatusSuggestion(delivery.status);
                    const isOutForDelivery = delivery.status === 'OUT_FOR_DELIVERY';
                    const isDelivered = delivery.status === 'DELIVERED';

                    return (
                      <tr key={delivery.id} className="hover:bg-navy-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to={`/shipments/${delivery.id}`}
                            className="font-mono font-bold text-primary-600 hover:underline"
                          >
                            {delivery.trackingNumber}
                          </Link>
                          {delivery.packageDescription && (
                            <div className="text-xs text-navy-500 truncate max-w-[180px]">
                              {delivery.packageDescription}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-navy-900">{delivery.receiverName}</div>
                          {delivery.receiverPhone && (
                            <a
                              href={`tel:${delivery.receiverPhone}`}
                              className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="h-3 w-3" /> {delivery.receiverPhone}
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-navy-600 max-w-[240px]">
                          <div className="truncate font-medium">{delivery.pickupAddress}</div>
                          <div className="text-navy-400 truncate">→ {delivery.deliveryAddress}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-navy-700">
                          {delivery.weight} kg
                        </td>
                        <td className="px-6 py-4">
                          <ShipmentStatusBadge status={delivery.status} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {!isDelivered && !isOutForDelivery && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStartTracking(delivery)}
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              title="Start Live Delivery and Stream GPS"
                            >
                              <PlayCircle className="h-3.5 w-3.5 mr-1" /> Start Delivery (GPS)
                            </Button>
                          )}

                          {isOutForDelivery && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/shipments/${delivery.id}/live-tracking`)}
                                className="h-8 px-2.5 text-xs text-primary-700 border-primary-200"
                              >
                                <Navigation className="h-3.5 w-3.5 mr-1" /> Live Map
                              </Button>

                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleOpenPodModal(delivery)}
                                className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Camera className="h-3.5 w-3.5 mr-1" /> Complete POD
                              </Button>
                            </>
                          )}

                          {nextStep && !isOutForDelivery && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenStatusModal(delivery)}
                              className="h-8 px-3 text-xs"
                            >
                              <Truck className="h-3.5 w-3.5 mr-1" /> {nextStep.label}
                            </Button>
                          )}

                          {isDelivered && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/shipments/${delivery.id}`)}
                              className="h-8 px-2.5 text-xs text-emerald-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Delivered
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Transition Modal */}
      {statusModalShipment && (
        <Modal
          isOpen={!!statusModalShipment}
          onClose={() => setStatusModalShipment(null)}
          title={`Update Shipment Status (${statusModalShipment.trackingNumber})`}
        >
          <div className="space-y-4">
            {statusError && (
              <div className="text-xs bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-200">
                {statusError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-navy-600 mb-1.5">
                Target Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-navy-200 bg-white text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PICKED_UP">PICKED_UP - Package collected from origin</option>
                <option value="IN_TRANSIT">IN_TRANSIT - En route between facilities</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY - Assigned for final dropoff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy-600 mb-1.5">
                Status Checkpoint Note
              </label>
              <Input
                placeholder="e.g. Scanned at regional distribution hub"
                value={statusDescription}
                onChange={(e) => setStatusDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button
                variant="ghost"
                onClick={() => setStatusModalShipment(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmStatusUpdate}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Updating...' : 'Confirm Update'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {podModalShipment && (
        <Modal
          isOpen={!!podModalShipment}
          onClose={() => setPodModalShipment(null)}
          title={`Upload Proof of Delivery (${podModalShipment.trackingNumber})`}
        >
          <div className="space-y-4">
            {podError && (
              <div className="text-xs bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-200">
                {podError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-navy-600 mb-1.5">
                Signee / Receiver Full Name *
              </label>
              <Input
                placeholder="Name of recipient who accepted the parcel"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy-600 mb-1.5">
                Proof of Delivery Photo *
              </label>
              <div className="border-2 border-dashed border-navy-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                {photoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={photoPreview}
                      alt="POD Preview"
                      className="max-h-48 mx-auto rounded-lg object-cover shadow-sm"
                    />
                    <label className="text-xs text-primary-600 font-semibold cursor-pointer hover:underline block">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block">
                    <UploadCloud className="h-8 w-8 text-navy-400 mx-auto" />
                    <p className="text-xs text-navy-700 font-medium">
                      Click to capture or upload signature/parcel photo
                    </p>
                    <p className="text-[11px] text-navy-400">JPG, PNG, WEBP up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button
                variant="ghost"
                onClick={() => setPodModalShipment(null)}
                disabled={isUploadingPod}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmPodUpload}
                disabled={isUploadingPod}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isUploadingPod ? 'Uploading POD...' : 'Finalize Delivery'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
