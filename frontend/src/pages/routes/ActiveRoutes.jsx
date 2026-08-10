import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/dateFormatter';
import StatusBadge from '../../components/ui/StatusBadge';
import { Truck, MapPin, Search, Navigation } from 'lucide-react';

const ActiveRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch routes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (routeId) => {
    setSelectedRoute(routeId);
    setDetailsLoading(true);
    try {
      const response = await api.get(`/routes/${routeId}`);
      setRouteDetails(response.data.data);
    } catch (error) {
      console.error("Failed to fetch route details", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeSidebar = () => {
    setSelectedRoute(null);
    setRouteDetails(null);
  };

  return (
    <div className="space-y-6 flex h-full">
      <div className={`flex-1 transition-all duration-300 ${selectedRoute ? 'pr-6 md:w-2/3' : 'w-full'}`}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Active Routes</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitor live delivery routes across the fleet.</p>
          </div>
        </div>

        <div className="glass rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search route or driver..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium">Driver</th>

                  <th className="px-6 py-3 font-medium">Total Stops</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading routes...</td></tr>
                ) : routes.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No active routes found.</td></tr>
                ) : (
                  routes.map(route => (
                    <tr 
                      key={route.id} 
                      onClick={() => handleRowClick(route.id)}
                      className={`cursor-pointer transition-colors ${selectedRoute === route.id ? 'bg-[var(--color-brand)]/5 border-l-4 border-[var(--color-brand)]' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'}`}
                    >
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {route.driverName ? route.driverName.substring(0, 2).toUpperCase() : 'DR'}
                        </div>
                        {route.driverName}
                      </td>

                      <td className="px-6 py-4 font-semibold">{route.totalStops} stops</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          route.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          route.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDateTime(route.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-out Panel for Route Details */}
      {selectedRoute && (
        <div className="hidden md:block w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-[calc(100vh-6rem)] overflow-y-auto fixed right-0 top-16 z-10 shadow-2xl transition-transform transform translate-x-0">
          <div className="p-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Navigation className="h-5 w-5 text-[var(--color-brand)]" />
                Route Details
              </h2>
              <button onClick={closeSidebar} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {detailsLoading ? (
              <div className="text-center text-gray-500 py-10">Loading route stops...</div>
            ) : !routeDetails ? (
              <div className="text-center text-gray-500 py-10">Could not load details.</div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Driver</span>
                    <span className="font-semibold">{routeDetails.driverName}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="font-bold text-[var(--color-brand)]">{routeDetails.status}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-lg flex items-center gap-2 mt-8 mb-4">
                  <MapPin className="h-5 w-5" /> Stop Sequence
                </h3>
                
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                  {routeDetails.stops && routeDetails.stops.map((stop, i) => (
                    <div key={stop.id} className="relative z-10">
                      <div className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-white ${
                        stop.status === 'COMPLETED' ? 'bg-emerald-500' : 
                        stop.status === 'ARRIVED' ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm text-[var(--color-brand)]">{stop.shipmentTrackingNumber}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            stop.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                          }`}>{stop.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          {stop.shipmentReceiverCity}
                        </p>
                        {stop.actualArrival && (
                          <p className="text-xs text-gray-400 mt-2">Arrived: {formatDateTime(stop.actualArrival)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRoutes;
