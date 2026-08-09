import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { formatDateOnly, formatDateTime } from '../../utils/dateFormatter';
import { ArrowLeft, PackagePlus, Edit2, Trash2, Clock, Package as PackageIcon, Truck, MapPin, ChevronDown, CheckCircle2, ChevronRight } from 'lucide-react';

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [shipment, setShipment] = useState(null);
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

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const [shipmentRes, internalHistoryRes] = await Promise.all([
        api.get(`/shipments/${id}`),
        api.get(`/shipments/${id}/history`)
      ]);
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-brand)]">{shipment.trackingNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                shipment.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                shipment.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {shipment.status}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Created on {formatDateTime(shipment.createdAt)}</p>
          </div>
        </div>
        
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
          )}
        </div>
      </div>

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
                  <p>{shipment.senderAddress?.line1}</p>
                  <p>{shipment.senderAddress?.city}, {shipment.senderAddress?.state} {shipment.senderAddress?.postalCode}</p>
                  <p>{shipment.senderAddress?.country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Receiver</h3>
                <p className="font-semibold text-gray-900 dark:text-white">{shipment.receiverName}</p>
                <p className="text-sm text-[var(--color-brand)] mb-2">{shipment.receiverPhone}</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{shipment.receiverAddress?.line1}</p>
                  <p>{shipment.receiverAddress?.city}, {shipment.receiverAddress?.state} {shipment.receiverAddress?.postalCode}</p>
                  <p>{shipment.receiverAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>

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
        </div>

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
              </div>
            )}
          </div>
        </div>
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
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ShipmentDetails;
