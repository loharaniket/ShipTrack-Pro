import React, { useState } from 'react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { Search, MapPin, Save, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';

const TrackingEvents = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [eventData, setEventData] = useState({
    status: 'IN_TRANSIT',
    eventType: 'SCAN',
    locationName: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setShipmentData(null);

    try {
      // Use the standard internal API to verify the shipment exists and fetch current status
      const response = await api.get(`/tracking/${trackingNumber.trim()}`);
      setShipmentData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Shipment not found for this tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEventData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (err) => {
          console.error("Error getting location", err);
          alert("Could not access your location. Please check browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        status: eventData.status,
        eventType: eventData.eventType,
        locationName: eventData.locationName || null,
        description: eventData.description || null,
        latitude: eventData.latitude ? parseFloat(eventData.latitude) : null,
        longitude: eventData.longitude ? parseFloat(eventData.longitude) : null,
      };

      await api.post(`/tracking/${trackingNumber.trim()}/events`, payload);
      
      setSuccessMsg('Event logged successfully!');
      setEventData({
        status: 'IN_TRANSIT',
        eventType: 'SCAN',
        locationName: '',
        description: '',
        latitude: '',
        longitude: ''
      });
      
      // Refresh the shipment data to show the new event
      handleSearch({ preventDefault: () => {} });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post tracking event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Scan & Update Tracking</h2>
        <p className="text-gray-500">Scan a barcode or enter a tracking number to log a new event.</p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative flex items-center shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="block w-full pl-12 pr-32 py-4 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-lg font-mono tracking-wider uppercase"
            placeholder="TRK-..."
            autoFocus
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Button type="submit" disabled={loading || !trackingNumber.trim()} className="h-10 px-6">
              {loading ? 'Searching...' : 'Lookup'}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      {shipmentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Event Form */}
          <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-lg mb-6 border-b pb-2 border-gray-100 dark:border-gray-800">Log New Event</h3>
            
            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    value={eventData.status} 
                    onChange={e => setEventData({...eventData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-brand)] outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="EXCEPTION">EXCEPTION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Event Type</label>
                  <select 
                    value={eventData.eventType} 
                    onChange={e => setEventData({...eventData, eventType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-brand)] outline-none"
                  >
                    <option value="SCAN">SCAN</option>
                    <option value="RECEIVED_AT_FACILITY">RECEIVED AT FACILITY</option>
                    <option value="DEPARTED_FACILITY">DEPARTED FACILITY</option>
                    <option value="CUSTOMS_CLEARANCE">CUSTOMS CLEARANCE</option>
                    <option value="PICKED_UP">PICKED UP</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location Name (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. Sort Facility, Chicago IL" 
                    value={eventData.locationName}
                    onChange={e => setEventData({...eventData, locationName: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-brand)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  rows="2"
                  placeholder="Additional details..." 
                  value={eventData.description}
                  onChange={e => setEventData({...eventData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-brand)] outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">GPS Coordinates</label>
                  <button type="button" onClick={handleGetLocation} className="text-xs flex items-center gap-1 text-[var(--color-brand)] hover:underline">
                    <Navigation className="h-3 w-3" /> Use Current Location
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" step="any" placeholder="Latitude" 
                    value={eventData.latitude} onChange={e => setEventData({...eventData, latitude: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm"
                  />
                  <input 
                    type="number" step="any" placeholder="Longitude" 
                    value={eventData.longitude} onChange={e => setEventData({...eventData, longitude: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 gap-2 text-lg rounded-xl shadow-md">
                  <Save className="h-5 w-5" />
                  {isSubmitting ? 'Posting Event...' : 'Post Event'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Current State Snapshot */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-300">Current Shipment State</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Status</span>
                <span className="font-bold text-[var(--color-brand)] text-lg">{shipmentData.currentStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-gray-500 mb-1">Created At</span>
                  <span className="font-medium">{new Date(shipmentData.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                   <span className="block text-gray-500 mb-1">Est. Delivery</span>
                   <span className="font-medium">{shipmentData.estimatedDelivery ? new Date(shipmentData.estimatedDelivery).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="block text-gray-500 mb-2">Latest Event</span>
                {shipmentData.events && shipmentData.events.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="font-medium">{shipmentData.events[0].status} ({shipmentData.events[0].eventType})</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(shipmentData.events[0].createdAt || shipmentData.events[0].recordedAt).toLocaleString()}</p>
                    {shipmentData.events[0].locationName && <p className="text-gray-500 text-xs mt-1">{shipmentData.events[0].locationName}</p>}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No events recorded yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackingEvents;
