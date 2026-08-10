import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { MapPin } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = React.useState(null);
  const [isTracking, setIsTracking] = React.useState(false);
  const [lastPushedLocation, setLastPushedLocation] = React.useState(null);

  React.useEffect(() => {
    if (currentUser?.role === 'LOGISTICS_OPERATOR') {
      api.get('/delivery/drivers/me')
        .then(res => setProfile(res.data.data))
        .catch(err => console.error("Failed to fetch driver profile", err));
    }
  }, [currentUser]);

  // Background GPS Pinger Effect
  React.useEffect(() => {
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
      navigator.geolocation.getCurrentPosition(pushLocation, handleLocationError);
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(pushLocation, handleLocationError);
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking, profile?.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-6">
      <div className="glass p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center space-y-6">
        <Package className="mx-auto h-16 w-16 text-[var(--color-brand)]" />
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
          Welcome to ShipTrack-Pro, {currentUser?.firstName}!
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Your centralized hub for managing and tracking shipments. 
        </p>
        
        <div className="pt-6 pb-4 flex flex-col items-center justify-center gap-4">
          <Button onClick={() => navigate('/shipments')} className="gap-2 text-lg px-8 py-3">
            Go to Shipments
            <ArrowRight className="h-5 w-5" />
          </Button>

          {currentUser?.role === 'LOGISTICS_OPERATOR' && (
            <div className="mt-4 flex flex-col items-center gap-2">
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
                  Last GPS update: {lastPushedLocation.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-left">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--color-brand)]" />
            Quick Track
          </h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const val = new FormData(e.target).get('trackingNumber');
              if (val) navigate(`/track/${val.trim()}`);
            }}
            className="flex gap-2"
          >
            <input 
              name="trackingNumber"
              type="text" 
              placeholder="Enter Tracking Number (e.g. TRK-XXXX)" 
              className="flex-1 px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              required
            />
            <Button type="submit" className="whitespace-nowrap px-6">Track</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
