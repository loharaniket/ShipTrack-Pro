import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/axios';
import { RefreshCcw, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';

// Fix for default Leaflet icon paths in React + Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FleetTracking = () => {
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      // Fetch all drivers
      const driversRes = await api.get('/delivery/drivers');
      const allDrivers = driversRes.data.data || [];
      setDrivers(allDrivers);

      // Fetch location for each driver
      const locData = {};
      await Promise.all(
        allDrivers.map(async (driver) => {
          try {
            const locRes = await api.get(`/delivery/drivers/${driver.id}/location`);
            if (locRes.data.data) {
              locData[driver.id] = locRes.data.data;
            }
          } catch (err) {
            // Driver might not have a location yet
          }
        })
      );
      setLocations(locData);
    } catch (err) {
      console.error('Failed to fetch fleet data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFleetData, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeDrivers = drivers.filter(d => locations[d.id]);
  const center = activeDrivers.length > 0 
    ? [locations[activeDrivers[0].id].latitude, locations[activeDrivers[0].id].longitude] 
    : [40.7128, -74.0060]; // Default to NY

  return (
    <div className='space-y-6 h-[calc(100vh-8rem)] flex flex-col'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Fleet Tracking</h1>
          <p className='text-gray-500 dark:text-gray-400'>Monitor your active delivery drivers in real-time.</p>
        </div>
        <Button onClick={fetchFleetData} disabled={loading} variant='outline' className='gap-2'>
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0'>
        {/* Map View */}
        <div className='lg:col-span-3 glass rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 relative h-full'>
          <MapContainer center={center} zoom={11} className='h-full w-full absolute inset-0 z-0'>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            {activeDrivers.map(driver => {
              const loc = locations[driver.id];
              return (
                <Marker key={driver.id} position={[loc.latitude, loc.longitude]}>
                  <Popup>
                    <div className='font-sans'>
                      <p className='font-bold text-gray-900 m-0 pb-1'>{driver.driverName}</p>
                      <p className='text-xs text-gray-500 m-0 pb-1'>License: {driver.licenseNumber}</p>
                      <p className='text-xs text-gray-400 m-0'>Last updated: {new Date(loc.recordedAt).toLocaleTimeString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Active Drivers List */}
        <div className='lg:col-span-1 glass p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden'>
          <h3 className='font-semibold mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
            <span>Active Drivers</span>
            <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full'>
              {activeDrivers.length} Online
            </span>
          </h3>
          
          <div className='overflow-y-auto flex-1 space-y-3 pr-2'>
            {activeDrivers.length === 0 ? (
              <p className='text-sm text-gray-500 text-center py-4'>No drivers currently sharing location.</p>
            ) : (
              activeDrivers.map(driver => (
                <div key={driver.id} className='p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='bg-blue-100 text-blue-600 p-2 rounded-lg'>
                      <Truck className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='font-semibold text-sm'>{driver.driverName}</p>
                      <p className='text-xs text-gray-500'>{driver.licenseNumber}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800'>
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
                    </span>
                    <span className='text-xs text-gray-500'>Online</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FleetTracking;
