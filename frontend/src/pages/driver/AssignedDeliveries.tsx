import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, Package, Search, Filter, RefreshCw, AlertCircle, 
  CheckCircle2, Phone, Camera, ArrowUpRight, UploadCloud 
} from 'lucide-react';
import { driverService } from '@/services/driverService';
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
    if (!receiverName.trim() || !photoFile) {
      setPodError('Please provide receiver name and photo.');
      return;
    }

    setIsUploadingPod(true);
    setPodError('');

    try {
      await driverService.uploadPod(podModalShipment.id, receiverName.trim(), photoFile);
      setSuccessMsg(`Delivery completed! Proof of Delivery uploaded.`);
      setPodModalShipment(null);
      await fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setPodError(err.message || 'Failed to upload POD photo');
    } finally {
      setIsUploadingPod(false);
    }
  };

  const filtered = deliveries.filter((d) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      d.trackingNumber.toLowerCase().includes(term) ||
      d.receiverName?.toLowerCase().includes(term) ||
      d.pickupAddress?.toLowerCase().includes(term) ||
      d.deliveryAddress?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' || d.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Assigned Delivery Shipments</h1>
          <p className="text-sm text-navy-500 mt-1">
            Complete active deliveries and capture recipient signatures & photos
          </p>
        </div>
        <Button variant="outline" onClick={fetchDeliveries} disabled={loading} className="h-10">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
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

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
              <Input
                placeholder="Search tracking #, recipient, addresses..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-navy-500 flex-shrink-0" />
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
                    <th className="px-6 py-3.5 text-right">Actions</th>
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
                          {canProgress && (
                            <Button size="sm" variant="outline" onClick={() => handleOpenStatusModal(d)} className="h-8 px-3 text-xs">
                              Update Status
                            </Button>
                          )}

                          {isOutForDelivery && (
                            <Button size="sm" variant="primary" onClick={() => handleOpenPodModal(d)} className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Camera className="h-3.5 w-3.5 mr-1" /> Upload POD
                            </Button>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-1">
                Select Next Lifecycle Status
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
            </div>

            <Input
              label="Activity Note / Location"
              required
              value={statusDescription}
              onChange={(e) => setStatusDescription(e.target.value)}
              placeholder="e.g. Scanned at delivery depot"
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setStatusModalShipment(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmStatusUpdate} isLoading={isUpdatingStatus}>
                Update Status
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
          title={`Upload POD: ${podModalShipment.trackingNumber}`}
        >
          <div className="space-y-4">
            {podError && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{podError}</span>
              </div>
            )}

            <Input
              label="Receiver Full Name"
              required
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g. Amit Sharma"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-1">
                Proof of Delivery Photo (.jpg, .png, .webp, max 5MB)
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy-200 hover:border-primary-500 rounded-xl p-6 cursor-pointer bg-navy-50/40 transition-colors">
                {photoPreview ? (
                  <div className="space-y-2 text-center">
                    <img src={photoPreview} alt="POD Preview" className="max-h-40 rounded-lg mx-auto object-cover border" />
                    <span className="text-xs text-primary-600 font-medium block">Choose a different image</span>
                  </div>
                ) : (
                  <div className="space-y-2 text-center text-navy-500">
                    <UploadCloud className="h-10 w-10 text-navy-400 mx-auto" />
                    <p className="text-sm font-medium text-navy-700">Click to attach photo</p>
                    <p className="text-xs text-navy-400">JPEG, PNG, WebP up to 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setPodModalShipment(null)}>Cancel</Button>
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
