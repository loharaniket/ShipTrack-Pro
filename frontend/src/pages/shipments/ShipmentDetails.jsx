import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, Edit2, PackagePlus, Trash2, MapPin, Package as PackageIcon, Clock, X, Users } from 'lucide-react';
import { formatDateOnly, formatDateTime } from '../../utils/dateFormatter';

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isTrackingEventModalOpen, setIsTrackingEventModalOpen] = useState(false);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' or 'HISTORY'
  const [newStatus, setNewStatus] = useState('IN_TRANSIT');

  const [editForm, setEditForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddressLine1: '',
    receiverCity: '',
    receiverState: '',
    receiverCountry: '',
    receiverPostalCode: '',
    priority: 'NORMAL'
  });

  const [packageForm, setPackageForm] = useState({
    weightKg: '',
    dimensionsCm: '',
    contentDescription: ''
  });

  const [trackingEventForm, setTrackingEventForm] = useState({
    status: 'IN_TRANSIT',
    eventType: 'SCAN',
    description: '',
    latitude: '',
    longitude: '',
    locationName: ''
  });

  const hasAccess = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);
  const canUpdateStatus = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'SUPPORT_AGENT'].includes(currentUser?.role);
  const canEdit = ['CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);
  const canAssignDriver = ['ADMINISTRATOR'].includes(currentUser?.role);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const [shipmentRes, historyRes] = await Promise.all([
        api.get(`/shipments/${id}`),
        api.get(`/shipments/${id}/history`)
      ]);
      const data = shipmentRes.data.data;
      setShipment(data);
      setHistory(historyRes.data.data || []);
      
      // Pre-fill edit form
      setEditForm({
        receiverName: data.receiverName || '',
        receiverPhone: data.receiverPhone || '',
        receiverAddressLine1: data.receiverAddress?.line1 || '',
        receiverCity: data.receiverAddress?.city || '',
        receiverState: data.receiverAddress?.state || '',
        receiverCountry: data.receiverAddress?.country || '',
        receiverPostalCode: data.receiverAddress?.postalCode || '',
        priority: data.priority || 'NORMAL'
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to cancel and delete this shipment? This cannot be undone.')) {
      try {
        await api.delete(`/shipments/${id}`);
        navigate('/shipments');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete shipment');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        receiverName: editForm.receiverName,
        receiverPhone: editForm.receiverPhone,
        receiverAddress: {
          line1: editForm.receiverAddressLine1,
          city: editForm.receiverCity,
          state: editForm.receiverState,
          country: editForm.receiverCountry,
          postalCode: editForm.receiverPostalCode
        },
        priority: editForm.priority
      };
      await api.put(`/shipments/${id}`, payload);
      setIsEditModalOpen(false);
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPackageSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/shipments/${id}/packages`, {
        weightKg: parseFloat(packageForm.weightKg),
        dimensionsCm: packageForm.dimensionsCm,
        contentDescription: packageForm.contentDescription
      });
      setIsPackageModalOpen(false);
      setPackageForm({ weightKg: '', dimensionsCm: '', contentDescription: '' });
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add package');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.post(`/shipments/${id}/history/${newStatus}`);
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddTrackingEventSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        status: trackingEventForm.status,
        eventType: trackingEventForm.eventType,
        description: trackingEventForm.description,
        locationName: trackingEventForm.locationName,
        ...(trackingEventForm.latitude && { latitude: parseFloat(trackingEventForm.latitude) }),
        ...(trackingEventForm.longitude && { longitude: parseFloat(trackingEventForm.longitude) })
      };
      await api.post(`/tracking/${shipment.trackingNumber}/events`, payload);
      setIsTrackingEventModalOpen(false);
      setTrackingEventForm({
        status: 'IN_TRANSIT',
        eventType: 'SCAN',
        description: '',
        latitude: '',
        longitude: '',
        locationName: ''
      });
      // Optionally re-fetch public tracking or just rely on history depending on how it's wired. 
      // We will re-fetch history just in case the backend syncs it.
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add tracking event');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssignModal = async () => {
    setIsAssignDriverModalOpen(true);
    try {
      const res = await api.get('/delivery/drivers');
      setDrivers(res.data.data || []);
    } catch (err) {
      alert('Failed to load drivers');
    }
  };

  const handleAssignDriverSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;
    setSaving(true);
    try {
      await api.post('/delivery/assignments', {
        shipmentId: id,
        driverId: selectedDriverId
      });
      setIsAssignDriverModalOpen(false);
      setSelectedDriverId('');
      alert('Driver assigned successfully');
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setSaving(false);
    }
  };

  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading shipment details...</div>;
  }

  if (error || !shipment) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Shipment not found'}</p>
        <Button onClick={() => navigate('/shipments')}>Back to Shipments</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 pb-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{shipment.trackingNumber}</h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Created on {formatDateOnly(shipment.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canAssignDriver && (
            <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleOpenAssignModal}>
              <Users className="h-4 w-4" />
              Assign Driver
            </Button>
          )}
          {canEdit && (
            <>
              <Button variant="outline" className="gap-2" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="h-4 w-4" />
                Edit Details
              </Button>
              <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Cancel Shipment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'DETAILS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('DETAILS')}
        >
          Shipment Details
        </button>
        <button 
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'HISTORY' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('HISTORY')}
        >
          Tracking History
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'DETAILS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sender & Receiver */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Sender Information
              </h2>
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{shipment.senderName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.senderPhone}</p>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>{shipment.senderAddress?.line1}</p>
                  <p>{shipment.senderAddress?.city}, {shipment.senderAddress?.state} {shipment.senderAddress?.postalCode}</p>
                  <p>{shipment.senderAddress?.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                Receiver Information
              </h2>
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{shipment.receiverName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.receiverPhone}</p>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>{shipment.receiverAddress?.line1}</p>
                  <p>{shipment.receiverAddress?.city}, {shipment.receiverAddress?.state} {shipment.receiverAddress?.postalCode}</p>
                  <p>{shipment.receiverAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages & Summary */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-purple-500" />
                  Assigned Packages
                </h2>
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => setIsPackageModalOpen(true)} className="gap-1 h-8">
                    <PackagePlus className="h-4 w-4" /> Add Package
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {shipment.packages?.map((pkg) => (
                  <div key={pkg.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{pkg.contentDescription}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID: {pkg.id}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Wt:</span> {pkg.weightKg} kg</p>
                      <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Dim:</span> {pkg.dimensionsCm}</p>
                    </div>
                  </div>
                ))}
                {(!shipment.packages || shipment.packages.length === 0) && (
                  <p className="text-gray-500 text-center py-4 text-sm">No packages found.</p>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
               <h2 className="text-lg font-semibold border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Shipment Details</h2>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500">Priority</span>
                   <span className="font-medium">{shipment.priority}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500">Company ID</span>
                   <span className="font-medium font-mono text-xs">{shipment.companyId || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between pt-1">
                   <span className="text-gray-500">Estimated Delivery</span>
                   <span className="font-medium text-blue-600">{shipment.estimatedDeliveryTime ? formatDateTime(shipment.estimatedDeliveryTime) : 'TBD'}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          
          {canUpdateStatus && (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">Manual Status Override:</h3>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-3 py-1.5 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CREATED">CREATED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="EXCEPTION">EXCEPTION</option>
              </select>
              <Button size="sm" onClick={handleStatusUpdate}>Update Status</Button>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Tracking History Timeline
            </h2>
            {canUpdateStatus && (
              <Button variant="outline" size="sm" onClick={() => setIsTrackingEventModalOpen(true)}>
                Add Tracking Event
              </Button>
            )}
          </div>
          
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No history events recorded.</p>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
              {history.map((evt, idx) => (
                <div key={evt.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 bg-blue-500" />
                  <div className="flex flex-col mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {evt.status}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{evt.statusRemarks}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <time>{formatDateTime(evt.recordedAt)}</time>
                      <span>&bull;</span>
                      <span>By: {evt.changedByName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Update Details */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold">Update Shipment Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <Input label="Receiver Name" value={editForm.receiverName} onChange={(e) => setEditForm({...editForm, receiverName: e.target.value})} required />
              <Input label="Receiver Phone" value={editForm.receiverPhone} onChange={(e) => setEditForm({...editForm, receiverPhone: e.target.value})} required />
              <Input label="Address Line 1" value={editForm.receiverAddressLine1} onChange={(e) => setEditForm({...editForm, receiverAddressLine1: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={editForm.receiverCity} onChange={(e) => setEditForm({...editForm, receiverCity: e.target.value})} required />
                <Input label="State" value={editForm.receiverState} onChange={(e) => setEditForm({...editForm, receiverState: e.target.value})} required />
                <Input label="Country" value={editForm.receiverCountry} onChange={(e) => setEditForm({...editForm, receiverCountry: e.target.value})} required />
                <Input label="Postal Code" value={editForm.receiverPostalCode} onChange={(e) => setEditForm({...editForm, receiverPostalCode: e.target.value})} required />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select 
                  value={editForm.priority} 
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                  className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Package */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold">Add Package</h2>
              <button onClick={() => setIsPackageModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPackageSubmit} className="p-6 space-y-4">
              <Input label="Weight (kg)" type="number" step="0.1" value={packageForm.weightKg} onChange={(e) => setPackageForm({...packageForm, weightKg: e.target.value})} required placeholder="2.0" />
              <Input label="Dimensions (cm)" value={packageForm.dimensionsCm} onChange={(e) => setPackageForm({...packageForm, dimensionsCm: e.target.value})} required placeholder="5x5x5" />
              <Input label="Content Description" value={packageForm.contentDescription} onChange={(e) => setPackageForm({...packageForm, contentDescription: e.target.value})} required placeholder="Documents or Electronics" />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsPackageModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Package'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Tracking Event */}
      {isTrackingEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold">Add Tracking Event</h2>
              <button onClick={() => setIsTrackingEventModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTrackingEventSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={trackingEventForm.status} 
                    onChange={(e) => setTrackingEventForm({...trackingEventForm, status: e.target.value})}
                    className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 outline-none"
                  >
                    <option value="CREATED">CREATED</option>
                    <option value="PICKED_UP">PICKED UP</option>
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="EXCEPTION">EXCEPTION</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium">Event Type</label>
                  <select 
                    value={trackingEventForm.eventType} 
                    onChange={(e) => setTrackingEventForm({...trackingEventForm, eventType: e.target.value})}
                    className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 outline-none"
                  >
                    <option value="SCAN">SCAN</option>
                    <option value="DEPARTURE">DEPARTURE</option>
                    <option value="ARRIVAL">ARRIVAL</option>
                    <option value="CUSTOMS_CLEARANCE">CUSTOMS CLEARANCE</option>
                    <option value="EXCEPTION">EXCEPTION</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </div>
              </div>
              
              <Input label="Description" value={trackingEventForm.description} onChange={(e) => setTrackingEventForm({...trackingEventForm, description: e.target.value})} required placeholder="e.g. Package arrived at facility." />
              <Input label="Location Name" value={trackingEventForm.locationName} onChange={(e) => setTrackingEventForm({...trackingEventForm, locationName: e.target.value})} placeholder="e.g. Mumbai Sort Facility" />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude (Optional)" type="number" step="any" value={trackingEventForm.latitude} onChange={(e) => setTrackingEventForm({...trackingEventForm, latitude: e.target.value})} placeholder="28.6139" />
                <Input label="Longitude (Optional)" type="number" step="any" value={trackingEventForm.longitude} onChange={(e) => setTrackingEventForm({...trackingEventForm, longitude: e.target.value})} placeholder="77.2090" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="ghost" onClick={() => setIsTrackingEventModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Event'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Driver */}
      {isAssignDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Assign Driver
              </h2>
              <button onClick={() => setIsAssignDriverModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAssignDriverSubmit} className="p-6 space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Select Driver</label>
                <select 
                  value={selectedDriverId} 
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 outline-none w-full"
                  required
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.driverName} ({driver.licenseNumber})
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && <p className="text-xs text-red-500 mt-1">No drivers available.</p>}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAssignDriverModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving || !selectedDriverId}>{saving ? 'Assigning...' : 'Assign to Shipment'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShipmentDetails;
