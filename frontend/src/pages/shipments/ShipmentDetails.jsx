import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { formatDateOnly, formatDateTime } from '../../utils/dateFormatter';
import { ArrowLeft, PackagePlus, Edit2, Trash2, Clock, Package as PackageIcon, Truck, MapPin } from 'lucide-react';

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]); // Public timeline
  const [internalHistory, setInternalHistory] = useState([]); // Internal audit trail
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [updatingHistory, setUpdatingHistory] = useState(false);
  const [updatingInternalHistory, setUpdatingInternalHistory] = useState(false);
  const [newInternalStatus, setNewInternalStatus] = useState('IN_TRANSIT');
  const [newEvent, setNewEvent] = useState({
    status: 'IN_TRANSIT',
    eventType: 'STATUS_UPDATE',
    description: '',
    locationName: '',
    latitude: '',
    longitude: ''
  });

  const [addingPackage, setAddingPackage] = useState(false);
  const [newPackage, setNewPackage] = useState({
    weightKg: '',
    length: '',
    width: '',
    height: '',
    contentDescription: ''
  });

  const canUpdateHistory = ['LOGISTICS_OPERATOR', 'SUPPORT_AGENT', 'ADMINISTRATOR'].includes(currentUser?.role);
  const canAddPackage = ['CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  useEffect(() => {
    if (newEvent.status === 'DELIVERED' && newEvent.eventType === 'DELIVERY') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setNewEvent(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }));
          },
          (error) => {
            console.error("Error fetching location:", error);
            alert("Could not automatically fetch location for delivery. Please enter coordinates manually or allow location access.");
          }
        );
      }
    }
  }, [newEvent.status, newEvent.eventType]);

  const handleUpdateHistory = async (e) => {
    e.preventDefault();
    
    if (newEvent.status === 'DELIVERED' && newEvent.eventType === 'DELIVERY') {
      if (!newEvent.latitude || !newEvent.longitude) {
        alert("Latitude and Longitude are mandatory for a Delivery event.");
        return;
      }
    }

    try {
      setUpdatingHistory(true);
      await api.post(`/tracking/${shipment.trackingNumber}/events`, {
        status: newEvent.status,
        eventType: newEvent.eventType,
        description: newEvent.description || null,
        locationName: newEvent.locationName || null,
        latitude: newEvent.latitude ? parseFloat(newEvent.latitude) : null,
        longitude: newEvent.longitude ? parseFloat(newEvent.longitude) : null
      });
      setNewEvent({
        status: newEvent.status,
        eventType: 'STATUS_UPDATE',
        description: '',
        locationName: '',
        latitude: '',
        longitude: ''
      });
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update tracking history');
    } finally {
      setUpdatingHistory(false);
    }
  };

  const handleUpdateInternalHistory = async (e) => {
    e.preventDefault();
    try {
      setUpdatingInternalHistory(true);
      await api.post(`/shipments/${id}/history/${newInternalStatus}`);
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update internal history');
    } finally {
      setUpdatingInternalHistory(false);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      setAddingPackage(true);
      await api.post(`/shipments/${id}/packages`, {
        id: null,
        weightKg: parseFloat(newPackage.weightKg),
        dimensionsCm: `${newPackage.length}x${newPackage.width}x${newPackage.height}`,
        contentDescription: newPackage.contentDescription
      });
      setNewPackage({ weightKg: '', length: '', width: '', height: '', contentDescription: '' });
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add package');
    } finally {
      setAddingPackage(false);
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;
    try {
      setAssigningDriver(true);
      await api.post(`/delivery/assignments`, {
        shipmentId: id,
        driverId: selectedDriverId
      });
      alert('Driver assigned successfully!');
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setAssigningDriver(false);
    }
  };

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

      if (shipmentData.trackingNumber) {
        try {
          const trackingRes = await api.get(`/tracking/${shipmentData.trackingNumber}`);
          setHistory(trackingRes.data.data.events || []);
        } catch (trackingErr) {
          console.error("Failed to fetch rich tracking events:", trackingErr);
          setHistory([]);
        }
      }

      if (currentUser?.role === 'ADMINISTRATOR') {
        try {
          const driversRes = await api.get('/delivery/drivers');
          setAvailableDrivers(driversRes.data.data || []);
        } catch (driverErr) {
          console.error("Failed to fetch drivers:", driverErr);
        }
      }
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading shipment details...</div>;
  }

  if (error || !shipment) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-status-error)] mb-4">{error || 'Shipment not found'}</p>
        <Button onClick={() => navigate('/shipments')}>Back to Shipments</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 pb-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{shipment.trackingNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                shipment.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                shipment.status === 'IN TRANSIT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {shipment.status}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Created on {formatDateOnly(shipment.createdAt)}</p>
          </div>
        </div>
        
        {!['LOGISTICS_OPERATOR', 'SUPPORT_AGENT', 'ADMINISTRATOR'].includes(currentUser?.role) && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/shipments/${id}/edit`)}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="gap-2 text-[var(--color-status-error)] hover:bg-[var(--color-status-error)] hover:text-white" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Order Details, Packages, Internal Ledger */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Routing Information */}
          <div className="glass p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <MapPin className="h-5 w-5 text-[var(--color-brand)]" />
              Routing Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Sender</h3>
                <p className="font-medium text-gray-900 dark:text-gray-100">{shipment.senderName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.senderPhone}</p>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>{shipment.senderAddress?.line1}</p>
                  <p>{shipment.senderAddress?.city}, {shipment.senderAddress?.state} {shipment.senderAddress?.postalCode}</p>
                  <p>{shipment.senderAddress?.country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Receiver</h3>
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

          {/* Packages */}
          <div className="glass p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-[var(--color-brand)]" />
                Packages
              </h2>
              <span className="text-sm font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                Priority: {shipment.priority}
              </span>
            </div>

            {canAddPackage && (
              <form onSubmit={handleAddPackage} className="mb-6 p-5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><PackagePlus className="h-5 w-5 text-[var(--color-brand)]"/> Add New Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-500">Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="e.g. 2.5" 
                      value={newPackage.weightKg} 
                      onChange={(e) => setNewPackage({...newPackage, weightKg: e.target.value})}
                      className="px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-500">Content Description</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Electronics, Documents" 
                      value={newPackage.contentDescription} 
                      onChange={(e) => setNewPackage({...newPackage, contentDescription: e.target.value})}
                      className="px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium text-gray-500">Length (cm)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="L" 
                        value={newPackage.length} 
                        onChange={(e) => setNewPackage({...newPackage, length: e.target.value})}
                        className="px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium text-gray-500">Width (cm)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="W" 
                        value={newPackage.width} 
                        onChange={(e) => setNewPackage({...newPackage, width: e.target.value})}
                        className="px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium text-gray-500">Height (cm)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="H" 
                        value={newPackage.height} 
                        onChange={(e) => setNewPackage({...newPackage, height: e.target.value})}
                        className="px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Button type="submit" disabled={addingPackage} className="text-sm px-6">
                    {addingPackage ? 'Adding...' : 'Add Package'}
                  </Button>
                </div>
              </form>
            )}
            
            <div className="space-y-4">
              {shipment.packages?.map((pkg, idx) => (
                <div key={pkg.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{pkg.contentDescription || 'Standard Package'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {pkg.id}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-left sm:text-right text-sm">
                    <p><span className="text-gray-500">Weight:</span> {pkg.weightKg} kg</p>
                    <p><span className="text-gray-500">Dimensions:</span> {pkg.dimensionsCm} cm</p>
                  </div>
                </div>
              ))}
              {(!shipment.packages || shipment.packages.length === 0) && (
                <p className="text-gray-500 text-center py-4">No packages added yet.</p>
              )}
            </div>
          </div>

          {/* Internal History Ledger */}
          {(currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'SUPPORT_AGENT' || currentUser?.role === 'BUSINESS_CLIENT') && (
            <div className="glass p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-6">
                <Clock className="h-5 w-5 text-gray-500" />
                Internal Ledger
              </h2>

              {canUpdateHistory && (
                <form onSubmit={handleUpdateInternalHistory} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-semibold mb-2">Log Status Update</h4>
                  <div className="flex gap-2">
                    <select
                      value={newInternalStatus}
                      onChange={(e) => setNewInternalStatus(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
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
                    <Button type="submit" disabled={updatingInternalHistory} className="whitespace-nowrap">
                      {updatingInternalHistory ? 'Saving...' : 'Add Log'}
                    </Button>
                  </div>
                </form>
              )}

              {internalHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No internal logs found.</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                  {internalHistory.map((log, index) => (
                    <div key={log.id || index} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 bg-gray-400" />
                      <div className="flex flex-col mb-1">
                        <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          Status changed to <span className="font-bold">{log.status}</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          by {log.changedByName || 'System'}
                        </p>
                        <time className="text-xs text-gray-400 mt-1">
                          {formatDateTime(log.timestamp)}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Driver Assignment Ledger */}
          {currentUser?.role === 'ADMINISTRATOR' && (
            <div className="glass p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-6">
                <Truck className="h-5 w-5 text-gray-500" />
                Assign Driver
              </h2>

              <form onSubmit={handleAssignDriver} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold mb-2">Select Driver for Assignment</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                  >
                    <option value="">-- Choose a Driver --</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>{d.driverName} (License: {d.licenseNumber})</option>
                    ))}
                  </select>
                  <Button type="submit" disabled={assigningDriver || !selectedDriverId} className="whitespace-nowrap">
                    {assigningDriver ? 'Assigning...' : 'Assign'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Physical Tracking Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl shadow-sm h-full">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-6">
              <Truck className="h-5 w-5 text-[var(--color-brand)]" />
              Tracking Timeline
            </h2>
            
            {canUpdateHistory && (
              <form onSubmit={handleUpdateHistory} className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-1">Add Tracking Event</h4>
                
                <div className="flex flex-col space-y-3">
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>

                  <select
                    value={newEvent.eventType}
                    onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                  >
                    <option value="SCAN">SCAN</option>
                    <option value="STATUS_UPDATE">STATUS UPDATE</option>
                    <option value="LOCATION_UPDATE">LOCATION UPDATE</option>
                    <option value="PICKUP">PICKUP</option>
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="EXCEPTION">EXCEPTION</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Location Name (e.g. Sort Facility, NY)" 
                    value={newEvent.locationName} 
                    onChange={(e) => setNewEvent({...newEvent, locationName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                  />

                  <input 
                    type="text" 
                    placeholder="Description (e.g. Package scanned)" 
                    value={newEvent.description} 
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      step="any"
                      placeholder="Latitude" 
                      required={newEvent.status === 'DELIVERED' && newEvent.eventType === 'DELIVERY'}
                      value={newEvent.latitude} 
                      onChange={(e) => setNewEvent({...newEvent, latitude: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                    />

                    <input 
                      type="number" 
                      step="any"
                      placeholder="Longitude" 
                      required={newEvent.status === 'DELIVERED' && newEvent.eventType === 'DELIVERY'}
                      value={newEvent.longitude} 
                      onChange={(e) => setNewEvent({...newEvent, longitude: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={updatingHistory} className="w-full text-sm py-2">
                    {updatingHistory ? 'Adding...' : 'Add Event to Timeline'}
                  </Button>
                </div>
              </form>
            )}
            
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tracking events yet.</p>
            ) : (
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                {history.map((event, index) => (
                  <div key={event.id || index} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${
                      index === 0 ? 'bg-[var(--color-brand)]' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="flex flex-col mb-1">
                      <h3 className={`font-semibold ${index === 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                        {event.status} {event.eventType && <span className="text-xs text-gray-400 font-normal ml-1">({event.eventType})</span>}
                      </h3>
                      <time className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDateTime(event.createdAt || event.recordedAt)}
                      </time>
                    </div>
                    {(event.locationName || event.location) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.locationName || event.location}
                      </p>
                    )}
                    {(event.description || event.notes) && (
                      <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded mt-2 border border-gray-100 dark:border-gray-800">
                        {event.description || event.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
