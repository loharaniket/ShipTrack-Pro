import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Truck, MapPin, Navigation, Package, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

const DriverDashboard = () => {
  const { currentUser } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDriverData();
    return () => stopLocationSharing();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/delivery/drivers/me');
      const profile = profileRes.data.data;
      setDriverProfile(profile);

      const assignmentsRes = await api.get('/delivery/drivers/me/assignments');
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load driver data', err);
      setError('Failed to load driver information. Ensure your profile is properly linked.');
    } finally {
      setLoading(false);
    }
  };

  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    if (!driverProfile?.id) {
      alert('Driver ID not found. Cannot share location.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLastLocation({ latitude, longitude });
        try {
          await api.post(`/delivery/drivers/${driverProfile.id}/location`, { latitude, longitude });
        } catch (err) {
          console.error('Failed to sync location with server', err);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(`Error getting location: ${error.message}`);
        stopLocationSharing();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    setWatchId(id);
    setIsSharingLocation(true);
  };

  const stopLocationSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharingLocation(false);
  };

  if (loading) return <div className='flex justify-center p-12'>Loading driver dashboard...</div>;
  if (error) return <div className='p-8 text-center text-red-500'>{error}</div>;

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Driver Dashboard</h1>
          <p className='text-gray-500 dark:text-gray-400'>Welcome back, {driverProfile?.driverName || currentUser?.firstName}. Manage your assignments.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='glass p-6 rounded-2xl shadow-sm md:col-span-1 space-y-6'>
          <div className='flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4'>
            <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600'>
              <Truck className='h-6 w-6' />
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>License Number</p>
              <p className='font-semibold'>{driverProfile?.licenseNumber}</p>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-4 flex items-center gap-2'>
              <Navigation className='h-5 w-5 text-gray-400' />
              Live Location Status
            </h3>
            
            {isSharingLocation ? (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800/30'>
                  <span className='relative flex h-3 w-3'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
                  </span>
                  <span className='text-sm font-medium'>Sharing Location Actively</span>
                </div>
                {lastLocation && (
                  <p className='text-xs text-gray-500 font-mono'>Lat: {lastLocation.latitude.toFixed(5)}, Lng: {lastLocation.longitude.toFixed(5)}</p>
                )}
                <Button onClick={stopLocationSharing} variant='outline' className='w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20'>Stop Sharing</Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <div className='h-3 w-3 rounded-full bg-gray-400'></div>
                  <span className='text-sm font-medium'>Currently Offline</span>
                </div>
                <Button onClick={startLocationSharing} className='w-full gap-2'><MapPin className='h-4 w-4' /> Start Shift & Share Location</Button>
              </div>
            )}
          </div>
        </div>

        <div className='glass p-6 rounded-2xl shadow-sm md:col-span-2 space-y-6'>
          <h2 className='text-lg font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
            <Package className='h-5 w-5 text-[var(--color-brand)]' /> Your Assigned Packages
          </h2>
          {assignments.length === 0 ? (
            <div className='text-center py-12 text-gray-500'><CheckCircle2 className='mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4' /><p>No active assignments.</p></div>
          ) : (
            <div className='space-y-4'>
              {assignments.map((assignment) => (
                <div key={assignment.id} className='p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-between gap-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-gray-900 dark:text-white'>Tracking ID: {assignment.shipment?.trackingNumber || assignment.shipmentId || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className='flex flex-col sm:items-end justify-between'>
                    <span className='text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded'>{assignment.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DriverDashboard;
