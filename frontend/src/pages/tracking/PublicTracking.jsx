import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/dateFormatter';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, MapPin, Package, Clock, Box, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon missing in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Truck Icon for Delivery Location
const deliveryIcon = new L.DivIcon({
  html: `<div class="bg-[var(--color-brand)] text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center" style="width: 36px; height: 36px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9l-3-3h-4v12h3"/><path d="M7 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});


const PublicTracking = () => {
  const { trackingNumber: routeTrackingNumber } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(routeTrackingNumber || '');
  const [trackingData, setTrackingData] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeTrackingNumber) {
      fetchTrackingData(routeTrackingNumber);
    }
  }, [routeTrackingNumber]);

  // Polling for live location if OUT_FOR_DELIVERY
  useEffect(() => {
    let intervalId;
    
    const pollLocation = async () => {
      try {
        const res = await api.get(`/tracking/${routeTrackingNumber}/location`);
        if (res.data?.data) {
          setLiveLocation(res.data.data);
        }
      } catch (err) {
        if (err.response?.status !== 400) {
          console.error("Failed to fetch live location", err);
        }
      }
    };

    if (routeTrackingNumber && trackingData?.currentStatus === 'OUT_FOR_DELIVERY') {
      // Fetch immediately once
      pollLocation();
      // Then poll every 15 seconds
      intervalId = setInterval(pollLocation, 15000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [routeTrackingNumber, trackingData?.currentStatus]);

  const fetchTrackingData = async (numberToTrack) => {
    if (!numberToTrack) return;
    
    setLoading(true);
    setError('');
    setTrackingData(null);
    setLiveLocation(null);

    try {
      const response = await api.get(`/tracking/${numberToTrack}`);
      const data = response.data.data;
      setTrackingData(data);

      if (data.currentStatus === 'OUT_FOR_DELIVERY') {
        fetchLiveLocation(numberToTrack);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find tracking information for this number.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveLocation = async (numberToTrack) => {
    try {
      // Intentionally call endpoint that requires no JWT for public view
      const locResponse = await api.get(`/tracking/${numberToTrack}/location`);
      if (locResponse.data?.data) {
         setLiveLocation(locResponse.data.data);
      }
    } catch (err) {
      console.error("Could not fetch live location", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
<<<<<<< HEAD
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 max-w-3xl mx-auto">
=======
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
>>>>>>> feat/route_management_service
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Box className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Your Package</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your tracking number below to see the latest updates.</p>
        </div>

<<<<<<< HEAD
        <form onSubmit={handleSearch} className="mb-10 max-w-3xl mx-auto">
=======
        <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto">
>>>>>>> feat/route_management_service
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
              className="block w-full pl-12 pr-32 py-4 border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] shadow-sm text-lg outline-none"
=======
              className="block w-full pl-12 pr-32 py-4 border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-lg outline-none"
>>>>>>> feat/route_management_service
              placeholder="e.g. TRK-ABC-123"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <Button type="submit" disabled={loading || !searchQuery.trim()} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Searching' : 'Track'}
              </Button>
            </div>
          </div>
        </form>

        {error && (
<<<<<<< HEAD
          <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-center shadow-sm">
=======
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-center shadow-sm max-w-2xl mx-auto mb-8">
>>>>>>> feat/route_management_service
            {error}
          </div>
        )}

        {trackingData && (
<<<<<<< HEAD
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-12">
            
            {/* Top Summary Card */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
=======
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
>>>>>>> feat/route_management_service
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tracking Number</p>
                  <p className="text-2xl font-bold text-[var(--color-brand)]">{trackingData.trackingNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <StatusBadge status={trackingData.currentStatus} />
                </div>
              </div>
              
              {trackingData.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 font-medium bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 p-3 rounded-lg inline-flex">
                  <Clock className="h-4 w-4" />
                  Estimated Delivery: {formatDateTime(trackingData.estimatedDelivery)}
                </div>
              )}
            </div>

<<<<<<< HEAD
            <div className={`p-6 grid grid-cols-1 ${liveLocation && trackingData.currentStatus === 'OUT_FOR_DELIVERY' ? 'lg:grid-cols-2 gap-8' : ''}`}>
              
              {/* Left Column: Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[var(--color-brand)]" />
=======
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Timeline Section */}
              <div className={`p-6 ${liveLocation ? 'border-r border-gray-200 dark:border-gray-700' : 'col-span-2'}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
>>>>>>> feat/route_management_service
                  Journey History
                </h3>

                {trackingData.events && trackingData.events.length > 0 ? (
                  <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
                    {trackingData.events.map((event, index) => (
                      <div key={event.id} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${
<<<<<<< HEAD
                          index === 0 ? 'bg-[var(--color-brand)]' : 'bg-gray-300 dark:bg-gray-600'
=======
                          index === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
>>>>>>> feat/route_management_service
                        }`} />
                        
                        <div className="flex flex-col mb-1">
                          <h4 className={`font-semibold text-lg ${index === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                            {event.status} 
                            <span className="text-sm font-normal text-gray-500 ml-2">({event.eventType})</span>
                          </h4>
                          <time className="text-sm text-gray-500 dark:text-gray-400 mt-1">
<<<<<<< HEAD
                            {formatDateTime(event.createdAt || event.timestamp || event.recordedAt)}
=======
                            {formatDateTime(event.createdAt)}
>>>>>>> feat/route_management_service
                          </time>
                        </div>

                        {event.locationName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-2">
<<<<<<< HEAD
                            <MapPin className="h-4 w-4 text-[var(--color-brand)]" />
=======
                            <MapPin className="h-4 w-4 text-blue-600" />
>>>>>>> feat/route_management_service
                            {event.locationName}
                          </p>
                        )}

                        {event.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-3 border border-gray-100 dark:border-gray-700">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No tracking events recorded yet.</p>
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {/* Right Column: Live Map (Conditional) */}
              {liveLocation && trackingData.currentStatus === 'OUT_FOR_DELIVERY' && (
                <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                     <Navigation className="h-5 w-5 text-emerald-500" />
                     Live Driver Location
                   </h3>
                   <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                     <MapContainer 
                        center={[liveLocation.latitude, liveLocation.longitude]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%', zIndex: 10 }}
                     >
                       <TileLayer
                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                       />
                       <Marker position={[liveLocation.latitude, liveLocation.longitude]} icon={deliveryIcon}>
                         <Popup>
                           <strong>Delivery Vehicle</strong><br />
                           Last updated: {formatDateTime(liveLocation.timestamp || new Date().toISOString())}
                         </Popup>
                       </Marker>
                     </MapContainer>
                   </div>
                   <p className="text-xs text-gray-500 text-center">Location is updated in real-time while the package is out for delivery.</p>
=======
              {/* Live Map Section */}
              {liveLocation && (
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Live Location
                  </h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Location:</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">{liveLocation.locationName}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      Lat: {liveLocation.latitude}, Lng: {liveLocation.longitude}
                    </p>
                  </div>
                  
                  <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
                    <div className="absolute inset-0 bg-blue-50 dark:bg-gray-800 animate-pulse"></div>
                    <iframe 
                      title="Live Tracking Map"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight="0" 
                      marginWidth="0" 
                      className="relative z-10"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${liveLocation.longitude - 0.05}%2C${liveLocation.latitude - 0.05}%2C${liveLocation.longitude + 0.05}%2C${liveLocation.latitude + 0.05}&layer=mapnik&marker=${liveLocation.latitude}%2C${liveLocation.longitude}`}
                    ></iframe>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live updates active (polling every 15s)
                  </div>
>>>>>>> feat/route_management_service
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTracking;
