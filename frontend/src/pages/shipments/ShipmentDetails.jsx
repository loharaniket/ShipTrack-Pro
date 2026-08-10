import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, Edit2, PackagePlus, Trash2, MapPin, Package as PackageIcon, Clock, X, Users } from 'lucide-react';
import { formatDateOnly, formatDateTime } from '../../utils/dateFormatter';
<<<<<<< HEAD
import { ArrowLeft, PackagePlus, Edit2, Trash2, Clock, Package as PackageIcon, Truck, MapPin, ChevronDown, CheckCircle2, ChevronRight } from 'lucide-react';
=======
>>>>>>> feat/route_management_service

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [shipment, setShipment] = useState(null);
<<<<<<< HEAD
  const [history, setHistory] = useState([]); 
  const [internalHistory, setInternalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  // Forms state
  const [newStatus, setNewStatus] = useState('IN_TRANSIT');
  const [newPackage, setNewPackage] = useState({ weightKg: '', length: '', width: '', height: '', contentDescription: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion state
  const [expandedPackage, setExpandedPackage] = useState(null);

  const isInternal = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'SUPPORT_AGENT'].includes(currentUser?.role);
  const isCustomer = ['BUSINESS_CLIENT', 'CUSTOMER'].includes(currentUser?.role);
  
  const canCancel = currentUser?.role === 'ADMINISTRATOR' || (isCustomer && (shipment?.status === 'CREATED' || shipment?.status === 'PENDING'));
=======
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
>>>>>>> feat/route_management_service

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
<<<<<<< HEAD
      const shipmentData = shipmentRes.data.data;
      setShipment(shipmentData);
      setInternalHistory(internalHistoryRes.data.data || []);
      
      // Fetch public timeline if tracking number exists
      if (shipmentData.trackingNumber) {
        try {
          const trackingRes = await api.get(`/tracking/${shipmentData.trackingNumber}`);
          setHistory(trackingRes.data.data.events || []);
        } catch (e) {
          console.error("No public tracking events yet.");
        }
      }
=======
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

>>>>>>> feat/route_management_service
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/shipments/${id}/history/${newStatus}`);
      setShowStatusModal(false);
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/shipments/${id}/packages`, {
        id: null,
        weightKg: parseFloat(newPackage.weightKg),
        dimensionsCm: `${newPackage.length}x${newPackage.width}x${newPackage.height}`,
        contentDescription: newPackage.contentDescription
      });
      setNewPackage({ weightKg: '', length: '', width: '', height: '', contentDescription: '' });
      setShowPackageModal(false);
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelShipment = async () => {
    if (window.confirm('Are you sure you want to cancel and delete this shipment? This cannot be undone.')) {
      try {
        await api.delete(`/shipments/${id}`);
        navigate('/shipments');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel shipment');
      }
    }
  };

<<<<<<< HEAD
  if (loading) return <div className="p-8 text-center text-gray-500">Loading shipment details...</div>;
  if (error || !shipment) return (
    <div className="p-8 text-center">
      <p className="text-[var(--color-status-error)] mb-4">{error || 'Shipment not found'}</p>
      <Button onClick={() => navigate('/shipments')}>Back to Shipments</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-4 pb-12 px-4 sm:px-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
=======
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
>>>>>>> feat/route_management_service
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-brand)]">{shipment.trackingNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                shipment.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                shipment.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {shipment.status}
              </span>
=======
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{shipment.trackingNumber}</h1>
              <StatusBadge status={shipment.status} />
>>>>>>> feat/route_management_service
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Created on {formatDateTime(shipment.createdAt)}</p>
          </div>
        </div>
<<<<<<< HEAD
        
        {/* Actions Dropdown */}
        <div className="relative">
          <Button 
            className="gap-2" 
            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
          >
            Actions <ChevronDown className="h-4 w-4" />
          </Button>
          
          {actionDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="py-1">
                {isInternal && (
                  <>
                    <button 
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => { setShowStatusModal(true); setActionDropdownOpen(false); }}
                    >
                      <Edit2 className="h-4 w-4 text-blue-500" /> Update Status
                    </button>
                    {currentUser?.role === 'ADMINISTRATOR' && (
                      <button 
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => { setShowPackageModal(true); setActionDropdownOpen(false); }}
                      >
                        <PackagePlus className="h-4 w-4 text-emerald-500" /> Add Package
                      </button>
                    )}
                  </>
                )}
                {canCancel && (
                  <button 
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                    onClick={() => { handleCancelShipment(); setActionDropdownOpen(false); }}
                  >
                    <Trash2 className="h-4 w-4" /> Cancel Shipment
                  </button>
                )}
              </div>
            </div>
=======

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
>>>>>>> feat/route_management_service
          )}
        </div>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* LEFT COLUMN: Details & Packages */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                Shipping Details
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sender</h3>
                <p className="font-semibold text-gray-900 dark:text-white">{shipment.senderName}</p>
                <p className="text-sm text-[var(--color-brand)] mb-2">{shipment.senderPhone}</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
=======
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
>>>>>>> feat/route_management_service
                  <p>{shipment.senderAddress?.line1}</p>
                  <p>{shipment.senderAddress?.city}, {shipment.senderAddress?.state} {shipment.senderAddress?.postalCode}</p>
                  <p>{shipment.senderAddress?.country}</p>
                </div>
              </div>
<<<<<<< HEAD
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Receiver</h3>
                <p className="font-semibold text-gray-900 dark:text-white">{shipment.receiverName}</p>
                <p className="text-sm text-[var(--color-brand)] mb-2">{shipment.receiverPhone}</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
=======
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
>>>>>>> feat/route_management_service
                  <p>{shipment.receiverAddress?.line1}</p>
                  <p>{shipment.receiverAddress?.city}, {shipment.receiverAddress?.state} {shipment.receiverAddress?.postalCode}</p>
                  <p>{shipment.receiverAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="glass rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-gray-500" />
                Packages ({shipment.packages?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {shipment.packages?.map((pkg, idx) => (
                <div key={pkg.id || idx} className="bg-white dark:bg-gray-800/50 transition-colors">
                  <button 
                    className="w-full p-4 flex justify-between items-center focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setExpandedPackage(expandedPackage === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{pkg.contentDescription || 'Standard Package'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{pkg.weightKg} kg</span>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedPackage === idx ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {expandedPackage === idx && (
                    <div className="p-4 pt-0 pl-16 pb-6 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Dimensions</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.dimensionsCm} cm</span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Package ID</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 font-mono text-xs">{pkg.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(!shipment.packages || shipment.packages.length === 0) && (
                <div className="p-8 text-center text-gray-500">No packages associated with this shipment.</div>
              )}
            </div>
          </div>
=======
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
>>>>>>> feat/route_management_service
        </div>
      )}

<<<<<<< HEAD
        {/* RIGHT COLUMN: Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl shadow-sm h-full min-h-[400px]">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <Clock className="h-5 w-5 text-gray-500" />
              Tracking Timeline
            </h2>
            
            {internalHistory.length === 0 && history.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <Clock className="h-12 w-12 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-gray-500">No tracking events recorded yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8 pb-4">
                {(isInternal ? internalHistory : history).map((event, index) => (
                  <div key={event.id || index} className="relative pl-6 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${
                      index === 0 ? 'bg-[var(--color-brand)]' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="flex flex-col mb-1">
                      <h3 className={`font-semibold ${index === 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                        {event.status} {event.eventType && <span className="text-xs font-normal opacity-70 ml-1">({event.eventType})</span>}
                      </h3>
                      <time className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        {formatDateTime(event.createdAt || event.timestamp || event.recordedAt)}
                      </time>
                    </div>
                    {event.changedByName && (
                      <p className="text-xs text-gray-500 mt-1">Updated by: {event.changedByName}</p>
                    )}
                    {(event.locationName || event.location) && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.locationName || event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-2 rounded mt-2 border border-gray-100 dark:border-gray-700">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
=======
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
>>>>>>> feat/route_management_service
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
<<<<<<< HEAD
      </div>

      {/* MODALS */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">Update Shipment Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none"
                >
                  <option value="CREATED">CREATED</option>
                  <option value="PICKED_UP">PICKED UP</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowStatusModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Confirm Update'}</Button>
=======
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
>>>>>>> feat/route_management_service
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><PackagePlus className="h-5 w-5"/> Add Package</h3>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Content Description</label>
                <input required type="text" value={newPackage.contentDescription} onChange={e => setNewPackage({...newPackage, contentDescription: e.target.value})} className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input required type="number" step="0.1" value={newPackage.weightKg} onChange={e => setNewPackage({...newPackage, weightKg: e.target.value})} className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">L (cm)</label>
                  <input required type="number" value={newPackage.length} onChange={e => setNewPackage({...newPackage, length: e.target.value})} className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">W (cm)</label>
                  <input required type="number" value={newPackage.width} onChange={e => setNewPackage({...newPackage, width: e.target.value})} className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">H (cm)</label>
                  <input required type="number" value={newPackage.height} onChange={e => setNewPackage({...newPackage, height: e.target.value})} className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowPackageModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Package'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
=======
>>>>>>> feat/route_management_service
    </div>
  );
};

export default ShipmentDetails;
