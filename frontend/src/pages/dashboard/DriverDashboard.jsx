import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Truck, MapPin, Navigation, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const DriverDashboard = () => {
  const { currentUser } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/delivery/drivers/me');
      setDriverProfile(profileRes.data.data);

      const routesRes = await api.get('/routes/driver/me');
      const routes = routesRes.data.data || [];
      const active = routes.find(r => r.status === 'ACTIVE');
      
      if (active) {
        const detailsRes = await api.get(`/routes/${active.id}`);
        setActiveRoute(detailsRes.data.data);
      } else {
        setActiveRoute(null);
      }
    } catch (err) {
      console.error('Failed to load driver data', err);
      setError('Failed to load route information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStopStatus = async (stopId, newStatus) => {
    if (!activeRoute) return;
    try {
      await api.put(`/routes/${activeRoute.id}/stops/${stopId}`, {
        status: newStatus,
        actualArrival: new Date().toISOString()
      });
      // Refresh the route details
      const detailsRes = await api.get(`/routes/${activeRoute.id}`);
      setActiveRoute(detailsRes.data.data);
    } catch (err) {
      alert("Failed to update stop status");
    }
  };

  const handleCompleteRoute = async () => {
    if (!activeRoute) return;
    try {
      await api.put(`/routes/${activeRoute.id}/status`, {
        status: 'COMPLETED'
      });
      setActiveRoute(null);
      alert("Route completed successfully!");
    } catch (err) {
      alert("Failed to complete route");
    }
  };

  if (loading) return <div className='flex justify-center p-12 text-gray-500'>Loading your route...</div>;
  if (error) return <div className='p-8 text-center text-red-500 flex flex-col items-center'><AlertCircle className="h-10 w-10 mb-2"/>{error}</div>;

  return (
    <div className='max-w-7xl mx-auto space-y-8'>
      
      {/* Web Dashboard Header */}
      <div className='glass p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden'>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand)]/10 to-transparent rounded-bl-full -z-10"></div>
        
        <div className='flex items-center gap-5 z-10'>
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-brand)]/10 flex items-center justify-center font-bold text-3xl text-[var(--color-brand)] shadow-inner">
            {driverProfile?.driverName ? driverProfile.driverName.charAt(0) : 'D'}
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
              {driverProfile?.driverName || currentUser?.firstName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
               <p className='text-gray-500 flex items-center gap-1 font-medium'>
                 <Truck className='h-4 w-4' /> {driverProfile?.licenseNumber}
               </p>
               {activeRoute && (
                 <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                   ROUTE ACTIVE
                 </span>
               )}
            </div>
          </div>
        </div>

        {activeRoute && (
          <div className="z-10">
            <Button size="lg" className="bg-red-500 hover:bg-red-600 border-none shadow-md gap-2 px-8" onClick={handleCompleteRoute}>
              <CheckCircle2 className="h-5 w-5"/> End Route
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area: Itinerary */}
      <div>
        <h2 className='text-2xl font-bold flex items-center gap-3 mb-6'>
          <Navigation className='h-6 w-6 text-[var(--color-brand)]' /> 
          Route Itinerary
        </h2>

        {!activeRoute ? (
          <div className='glass rounded-3xl p-16 text-center text-gray-400 border border-gray-100 dark:border-gray-800 shadow-sm'>
            <Package className='mx-auto h-16 w-16 mb-4 text-gray-300 dark:text-gray-600' />
            <p className="text-xl font-medium text-gray-500 dark:text-gray-300">No active route assigned.</p>
            <p className="mt-2 text-gray-400">Wait for the dispatcher to assign your next run.</p>
          </div>
        ) : (
          <div className='glass rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm'>
            <div className="space-y-6 relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full hidden sm:block"></div>
              
              {activeRoute.stops.map((stop, index) => (
                <div key={stop.id} className="relative z-10 flex flex-col sm:flex-row gap-6 group">
                  
                  {/* Stop Number Indicator */}
                  <div className="hidden sm:flex h-14 w-14 rounded-full border-4 border-white dark:border-gray-900 items-center justify-center font-bold text-xl shrink-0 transition-transform group-hover:scale-110 shadow-sm z-10 bg-white dark:bg-gray-800">
                    <span className={`${
                      stop.status === 'COMPLETED' ? 'text-emerald-500' :
                      stop.status === 'ARRIVED' ? 'text-yellow-500' : 'text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Web Card Design */}
                  <div className={`flex-1 p-6 sm:p-8 bg-white dark:bg-gray-800/80 border rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition-all ${
                     stop.status === 'COMPLETED' ? 'border-emerald-200 dark:border-emerald-900/50 opacity-70' :
                     stop.status === 'ARRIVED' ? 'border-yellow-300 dark:border-yellow-700 shadow-md ring-2 ring-yellow-400/20' : 
                     'border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-[var(--color-brand)]'
                  }`}>
                    
                    <div className="space-y-3 flex-1 w-full">
                      <div className="flex justify-between items-start w-full">
                        <div className="flex items-center gap-3">
                          <span className="sm:hidden h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm text-gray-500">
                            {index + 1}
                          </span>
                          <div>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Shipment ID</p>
                             <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stop.shipmentTrackingNumber}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          stop.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                          stop.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                        }`}>{stop.status}</span>
                      </div>
                      
                      <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <MapPin className="h-5 w-5 text-[var(--color-brand)] shrink-0 mt-0.5" />
                        <p className="text-sm sm:text-base font-medium leading-relaxed">
                          {stop.shipmentReceiverAddress || 'Full address unavailable'}, {stop.shipmentReceiverCity}
                        </p>
                      </div>

                      {stop.actualArrival && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 font-medium px-1">
                          <Clock className="h-3 w-3" /> Arrived at: {new Date(stop.actualArrival).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-6">
                      {stop.status === 'PENDING' && (
                        <Button size="lg" className="w-full shadow-md py-6 text-lg font-bold" onClick={() => handleUpdateStopStatus(stop.id, 'ARRIVED')}>
                           Arrived
                        </Button>
                      )}
                      {stop.status === 'ARRIVED' && (
                        <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 border-none shadow-md py-6 text-lg font-bold" onClick={() => handleUpdateStopStatus(stop.id, 'COMPLETED')}>
                          Completed
                        </Button>
                      )}
                      {stop.status === 'COMPLETED' && (
                        <div className="w-full py-4 text-center text-emerald-500 font-bold flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                          <CheckCircle2 className="h-5 w-5" /> Done
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DriverDashboard;
