import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, Package, Search, Filter, RefreshCw, AlertCircle, 
  CheckCircle2, Phone, Camera, ArrowUpRight, UploadCloud,
  Navigation, Radio, PlayCircle, StopCircle, ExternalLink
} from 'lucide-react';
import { driverService } from '@/services/driverService';
import { liveTrackingService, DriverLocationDto } from '@/services/liveTrackingService';
import { CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function AssignedDeliveries() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState<CustomerShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Live GPS Tracking State
  const [activeTrackingSession, setActiveTrackingSession] = useState<DriverLocationDto | null>(null);
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const geoWatchIdRef = useRef<number | null>(null);

  // Status Modal State
  const [statusModalShipment, setStatusModalShipment] = useState<CustomerShipmentItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY'>('PICKED_UP');
  const [statusDescription, setStatusDescription] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  // POD Modal State
  const [podModalShipment, setPodModalShipment] = useState<CustomerShipmentItem | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPod, setIsUploadingPod] = useState(false);
  const [podError, setPodError] = useState('');

  useEffect(() => {
    fetchDeliveries();
    return () => {
      stopGeolocationWatcher();
    };
  }, []);

  const fetchDeliveries = async () => {
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

    navigator.geolocation.getCurrentPosition(
      sendPosition,
      (err) => console.warn('Geo current error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

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
      await fetchDeliveries();
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
      await fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to stop live tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleOpenStatusModal = (shipment: CustomerShipmentItem) => {
    setStatusModalShipment(shipment);
    const s = shipment.status.toUpperCase();
    if (s === 'ASSIGNED') {
      setTargetStatus('PICKED_UP');
      setStatusDescription('Package picked up from origin/hub');
    } else if (s === 'PICKED_UP') {
      setTargetStatus('IN_TRANSIT');
      setStatusDescription('In transit towards delivery location');
    } else {
      setTargetStatus('OUT_FOR_DELIVERY');
      setStatusDescription('Out for final delivery');
    }
    setStatusError('');
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModalShipment) return;
    setIsUpdatingStatus(true);
    setStatusError('');

    try {
      await driverService.updateShipmentStatus(
        statusModalShipment.id,
        targetStatus,
        statusDescription.trim() || `Status changed to ${targetStatus}`
      );
      setSuccessMsg(`Shipment ${statusModalShipment.trackingNumber} status updated to ${targetStatus}!`);
      setStatusModalShipment(null);
      await fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update status');
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
        setPodError('Photo exceeds 5MB limit.');
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
      setPodError('Receiver name is required');
      return;
    }
    if (!photoFile) {
      setPodError('Proof of delivery photo is required');
      return;
    }

    setIsUploadingPod(true);
    setPodError('');

    try {
      await driverService.uploadPod(podModalShipment.id, receiverName.trim(), photoFile);
      stopGeolocationWatcher();
      setActiveTrackingSession(null);
      setSuccessMsg(`Delivery completed! POD uploaded for shipment ${podModalShipment.trackingNumber}`);
      setPodModalShipment(null);
      await fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setPodError(err.message || 'Failed to upload POD');
    } finally {
      setIsUploadingPod(false);
    }
  };

  const filtered = deliveries.filter((d) => {
    const matchSearch = 
      d.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeOutForDelivery = deliveries.find(d => d.status === 'OUT_FOR_DELIVERY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Assigned Deliveries & Live GPS</h1>
          <p className="text-sm text-navy-500 mt-1">
            Pick shipments, broadcast real-time telemetry, and upload proof of delivery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchDeliveries} disabled={loading}>
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

      {/* ACTIVE LIVE DELIVERY BANNER */}
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
                Shipment #{activeOutForDelivery.trackingNumber}
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

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
              <Input
                placeholder="Search tracking #, name, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-navy-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading deliveries...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Truck className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Deliveries Found</h3>
              <p className="text-sm text-navy-500 mt-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try modifying your search or filter settings.'
                  : 'No packages are currently assigned to your route.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Tracking Number</th>
                    <th className="px-6 py-3.5">Recipient & Contact</th>
                    <th className="px-6 py-3.5">Pickup → Delivery</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Workflow & GPS Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((d) => {
                    const isOutForDelivery = d.status === 'OUT_FOR_DELIVERY';
                    const isDelivered = d.status === 'DELIVERED';
                    const canProgress = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status);

                    return (
                      <tr key={d.id} className="hover:bg-navy-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/shipments/${d.id}`} className="font-mono font-bold text-primary-600 hover:underline">
                            {d.trackingNumber}
                          </Link>
                          {d.packageDescription && (
                            <div className="text-xs text-navy-500 truncate max-w-[180px]">{d.packageDescription}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-navy-900">{d.receiverName}</div>
                          {d.receiverPhone && (
                            <a href={`tel:${d.receiverPhone}`} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {d.receiverPhone}
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-navy-600 max-w-[240px]">
                          <div className="truncate font-medium">{d.pickupAddress}</div>
                          <div className="text-navy-400 truncate">→ {d.deliveryAddress}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-navy-700">
                          {d.weight} kg
                        </td>
                        <td className="px-6 py-4">
                          <ShipmentStatusBadge status={d.status} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {!isDelivered && !isOutForDelivery && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStartTracking(d)}
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              title="Start Live Delivery and Stream GPS"
                            >
                              <PlayCircle className="h-3.5 w-3.5 mr-1" /> Start Delivery (GPS)
                            </Button>
                          )}

                          {canProgress && (
                            <Button size="sm" variant="outline" onClick={() => handleOpenStatusModal(d)} className="h-8 px-2.5 text-xs">
                              Checkpoint
                            </Button>
                          )}

                          {isOutForDelivery && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/shipments/${d.id}/live-tracking`)}
                                className="h-8 px-2.5 text-xs text-primary-700 border-primary-200"
                              >
                                <Navigation className="h-3.5 w-3.5 mr-1" /> Live Map
                              </Button>

                              <Button size="sm" variant="primary" onClick={() => handleOpenPodModal(d)} className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Camera className="h-3.5 w-3.5 mr-1" /> Complete POD
                              </Button>
                            </>
                          )}

                          {isDelivered && (
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/shipments/${d.id}`)} className="h-8 px-2.5 text-xs text-emerald-700">
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

      {/* Status Modal */}
      {statusModalShipment && (
        <Modal
          isOpen={true}
          onClose={() => setStatusModalShipment(null)}
          title={`Update Status: ${statusModalShipment.trackingNumber}`}
        >
          <div className="space-y-4">
            {statusError && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{statusError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Status</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-navy-200 bg-white text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PICKED_UP">PICKED UP (Package collected from sender)</option>
                <option value="IN_TRANSIT">IN TRANSIT (On the way to hub/destination)</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (On the way to customer)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Checkpoint Note</label>
              <Input
                placeholder="e.g. Scanned at warehouse"
                value={statusDescription}
                onChange={(e) => setStatusDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setStatusModalShipment(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmStatusUpdate} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* POD Modal */}
      {podModalShipment && (
        <Modal
          isOpen={true}
          onClose={() => setPodModalShipment(null)}
          title={`Upload Proof of Delivery: ${podModalShipment.trackingNumber}`}
        >
          <div className="space-y-4">
            {podError && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{podError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Receiver Name *</label>
              <Input
                placeholder="Full name of receiver"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Delivery Photo / Signature *</label>
              <div className="border-2 border-dashed border-navy-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                {photoPreview ? (
                  <div className="space-y-2">
                    <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                    <label className="text-xs text-primary-600 font-semibold cursor-pointer hover:underline block">
                      Change Photo
                      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block">
                    <UploadCloud className="h-8 w-8 text-navy-400 mx-auto" />
                    <p className="text-xs text-navy-700 font-medium">Click to take photo or upload file</p>
                    <p className="text-[11px] text-navy-400">JPG, PNG up to 5MB</p>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setPodModalShipment(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmPodUpload} disabled={isUploadingPod} className="bg-emerald-600 hover:bg-emerald-700">
                {isUploadingPod ? 'Uploading POD...' : 'Confirm Delivery'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
