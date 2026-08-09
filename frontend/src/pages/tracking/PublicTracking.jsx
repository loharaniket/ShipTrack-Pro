import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/dateFormatter';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, MapPin, Package, Clock, Box } from 'lucide-react';

const PublicTracking = () => {
  const { trackingNumber: routeTrackingNumber } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(routeTrackingNumber || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeTrackingNumber) {
      fetchTrackingData(routeTrackingNumber);
    }
  }, [routeTrackingNumber]);

  const fetchTrackingData = async (numberToTrack) => {
    if (!numberToTrack) {
      return;
    }
    
    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await api.get(`/tracking/${numberToTrack}`);
      setTrackingData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find tracking information for this number.');
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-[var(--color-brand)] rounded-xl flex items-center justify-center shadow-lg">
              <Box className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Your Package</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your tracking number below to see the latest updates.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-32 py-4 border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] shadow-sm text-lg"
              placeholder="e.g. TRK-ABC-123"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <Button type="submit" disabled={loading || !searchQuery.trim()} className="h-10 px-6 rounded-xl">
                {loading ? 'Searching' : 'Track'}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-center shadow-sm">
            {error}
          </div>
        )}

        {trackingData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tracking Number</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{trackingData.trackingNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <StatusBadge status={trackingData.currentStatus} />
                </div>
              </div>
              
              {trackingData.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-brand)] font-medium bg-[var(--color-brand)]/10 p-3 rounded-lg inline-flex">
                  <Clock className="h-4 w-4" />
                  Estimated Delivery: {formatDateTime(trackingData.estimatedDelivery)}
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--color-brand)]" />
                Journey History
              </h3>

              {trackingData.events && trackingData.events.length > 0 ? (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
                  {trackingData.events.map((event, index) => (
                    <div key={event.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        index === 0 ? 'bg-[var(--color-brand)]' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                      
                      <div className="flex flex-col mb-1">
                        <h4 className={`font-semibold text-lg ${index === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                          {event.status} 
                          <span className="text-sm font-normal text-gray-500 ml-2">({event.eventType})</span>
                        </h4>
                        <time className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDateTime(event.createdAt)}
                        </time>
                      </div>

                      {event.locationName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-2">
                          <MapPin className="h-4 w-4 text-[var(--color-brand)]" />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTracking;
