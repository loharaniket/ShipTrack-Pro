import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { MapPin, Users, X } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter';

const DriverDirectory = () => {
  const { currentUser } = useAuth();
  const hasAccess = ['ADMINISTRATOR'].includes(currentUser?.role);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live Tracking Modal State
  const [trackingDriverId, setTrackingDriverId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    if (hasAccess) {
      fetchDrivers();
    }
  }, [hasAccess]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/drivers');
      setDrivers(res.data.data || []);
    } catch (err) {
      setError('Failed to load drivers.');
    } finally {
      setLoading(false);
    }
  };

  // Live Location Polling Effect
  useEffect(() => {
    let intervalId;
    const fetchLocation = async () => {
      if (!trackingDriverId) return;
      try {
        const res = await api.get(`/delivery/drivers/${trackingDriverId}/location`);
        if (res.data?.data) {
          setDriverLocation(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch driver location", err);
      }
    };

    if (trackingDriverId) {
      fetchLocation(); // fetch immediately
      intervalId = setInterval(fetchLocation, 15000); // poll every 15s
    } else {
      setDriverLocation(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [trackingDriverId]);

  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. You do not have permission to view the fleet directory.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mb-12 px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Fleet & Driver Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your delivery personnel.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading drivers...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Driver Name</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">License Number</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Experience</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {drivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{driver.driverName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{driver.licenseNumber}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{driver.experienceYears} Years</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setTrackingDriverId(driver.id)} className="gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        Track Live
                      </Button>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {trackingDriverId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Live Tracking
              </h2>
              <button onClick={() => setTrackingDriverId(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {driverLocation ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Last Recorded At</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {driverLocation.recordedAt ? formatDateTime(driverLocation.recordedAt) : 'Just now'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live Updates Active
                    </div>
                  </div>
                  
                  <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
                    <div className="absolute inset-0 bg-blue-50 dark:bg-gray-800 animate-pulse"></div>
                    <iframe 
                      title="Driver Location Map"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight="0" 
                      marginWidth="0" 
                      className="relative z-10"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${driverLocation.longitude - 0.02}%2C${driverLocation.latitude - 0.02}%2C${driverLocation.longitude + 0.02}%2C${driverLocation.latitude + 0.02}&layer=mapnik&marker=${driverLocation.latitude}%2C${driverLocation.longitude}`}
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Locating driver...</p>
                  <p className="text-xs text-gray-400 mt-2">Driver must have app open and location permissions granted.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDirectory;
