import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter';
import Button from '../../components/ui/Button';

const DriverDashboard = () => {
  const { currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // GPS Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [lastPushedLocation, setLastPushedLocation] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'LOGISTICS_OPERATOR') {
      fetchDriverData();
    }
  }, [currentUser]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const [profileRes, assignmentsRes] = await Promise.all([
        api.get('/delivery/drivers/me'),
        api.get('/delivery/drivers/me/assignments')
      ]);
      setProfile(profileRes.data.data);
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      setError('Failed to load driver dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Background GPS Pinger Effect
  useEffect(() => {
    let intervalId;

    const pushLocation = (position) => {
      if (!profile?.id) return;
      
      const payload = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      api.post(`/delivery/drivers/${profile.id}/location`, payload)
        .then(() => {
          setLastPushedLocation(new Date());
        })
        .catch(err => console.error("Failed to push location", err));
    };

    const handleLocationError = (err) => {
      console.error('Geolocation error:', err);
    };

    if (isTracking && 'geolocation' in navigator) {
      // Push immediately once
      navigator.geolocation.getCurrentPosition(pushLocation, handleLocationError);
      
      // Then poll every 30 seconds
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(pushLocation, handleLocationError);
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking, profile?.id]);

  if (currentUser?.role !== 'LOGISTICS_OPERATOR') {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. Logistics Operator view only.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12 px-4 sm:px-6 py-8">
      {/* Header Profile */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Welcome back, {profile?.driverName || 'Driver'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">License: {profile?.licenseNumber}</p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <Button 
            onClick={() => setIsTracking(!isTracking)}
            className={`gap-2 ${isTracking ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <MapPin className="h-4 w-4" />
            {isTracking ? 'Stop GPS Tracking (Go Off Duty)' : 'Start GPS Tracking (Go On Duty)'}
          </Button>
          
          {isTracking && lastPushedLocation && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Last updated: {lastPushedLocation.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>}

      {/* Assignments List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          My Assignments
        </h2>

        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <CheckCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">You have no active assignments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Shipment Details</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold rounded-full">
                    {assignment.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-500 font-mono text-sm">{assignment.shipmentId}</p>
                  <a href={`/shipments/${assignment.shipmentId}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details →
                  </a>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <Clock className="h-4 w-4" />
                  Assigned At: {formatDateTime(assignment.assignedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
