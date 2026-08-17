import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, Package, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  MapPin, Phone, Camera, ArrowRight, UploadCloud, Check, User 
} from 'lucide-react';
import { driverService } from '@/services/driverService';
import { CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';
import { useAuth } from '@/context/AuthContext';

export function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState<CustomerShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
  const readyForPodCount = deliveries.filter(d => d.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Courier Delivery Dashboard</h1>
          <p className="text-sm text-navy-500 mt-1">
            Welcome back, {user?.name || 'Driver'}. Manage your assigned delivery routes and proof of deliveries.
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
              <p className="text-xs font-bold uppercase text-sky-600 tracking-wider">Active In-Progress</p>
              <p className="text-2xl font-extrabold text-sky-600 mt-1">{loading ? '...' : inProgressCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-purple-700 tracking-wider">Ready for POD</p>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">{loading ? '...' : readyForPodCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Completed</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{loading ? '...' : deliveredCount}</p>
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
            <p className="text-xs text-navy-500 mt-0.5">Progress shipment statuses or capture POD to finalize delivery</p>
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
                          {nextStep && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenStatusModal(delivery)}
                              className="h-8 px-3 text-xs"
                            >
                              <Truck className="h-3.5 w-3.5 mr-1" /> {nextStep.label}
                            </Button>
                          )}

                          {isOutForDelivery && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenPodModal(delivery)}
                              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Camera className="h-3.5 w-3.5 mr-1" /> Complete (POD)
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

            <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-500">Current Status:</span>
                <ShipmentStatusBadge status={statusModalShipment.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">New Status:</span>
                <ShipmentStatusBadge status={targetStatus} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-1">
                Update Status To
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PICKED_UP">PICKED_UP (Courier Picked Up Package)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (In Transit Between Hubs)</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Out for Final Delivery)</option>
              </select>
              <p className="text-xs text-navy-400 mt-1">
                Note: Direct transition to DELIVERED is not allowed here. Complete delivery via Proof of Delivery upload.
              </p>
            </div>

            <Input
              label="Activity Note / Description"
              required
              value={statusDescription}
              onChange={(e) => setStatusDescription(e.target.value)}
              placeholder="e.g. Package scanned and loaded on vehicle"
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setStatusModalShipment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmStatusUpdate}
                isLoading={isUpdatingStatus}
              >
                Confirm Update
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Proof of Delivery (POD) Upload Modal */}
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

            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200 text-xs space-y-1">
              <p className="font-semibold text-emerald-900">Final Delivery Confirmation</p>
              <p className="text-emerald-700">
                Uploading the receiver's photo/signature will immediately mark this shipment as <strong>DELIVERED</strong> and dispatch customer delivery notifications.
              </p>
            </div>

            <Input
              label="Receiver / Signee Full Name"
              required
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g. Amit Sharma (Received by recipient)"
            />

            {/* Photo Capture / File Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-1">
                POD Photo / Signature (.jpg, .png, .webp, max 5MB)
              </label>
              
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy-200 hover:border-primary-500 rounded-xl p-6 cursor-pointer bg-navy-50/40 transition-colors">
                {photoPreview ? (
                  <div className="space-y-2 text-center">
                    <img
                      src={photoPreview}
                      alt="POD Preview"
                      className="max-h-40 rounded-lg mx-auto object-cover border border-navy-200 shadow-sm"
                    />
                    <span className="text-xs text-primary-600 font-medium block">Click to choose a different photo</span>
                  </div>
                ) : (
                  <div className="space-y-2 text-center text-navy-500">
                    <UploadCloud className="h-10 w-10 text-navy-400 mx-auto" />
                    <p className="text-sm font-medium text-navy-700">Click or tap to attach photo / capture camera</p>
                    <p className="text-xs text-navy-400">JPEG, PNG, WebP up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setPodModalShipment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleConfirmPodUpload}
                isLoading={isUploadingPod}
                disabled={!photoFile || !receiverName.trim()}
              >
                Upload POD & Complete Delivery
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
