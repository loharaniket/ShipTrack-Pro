import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/axios';
import { RefreshCcw, Truck, User, PlusCircle, CheckCircle2 } from 'lucide-react';
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

const deliveryIcon = new L.DivIcon({
  html: `<div class="bg-[var(--color-brand)] text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center" style="width: 36px; height: 36px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9l-3-3h-4v12h3"/><path d="M7 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const FleetTracking = () => {
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ shipmentId: '', driverId: '' });
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      // Fetch vehicles and drivers
      const [driversRes] = await Promise.all([
        api.get('/delivery/drivers')
      ]);
      
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
    // Refresh map every 15 seconds
    const interval = setInterval(fetchFleetData, 15000);
    return () => clearInterval(interval);
  }, []);

  const openAssignModal = async () => {
    setShowAssignModal(true);
    setSuccessMsg('');
    try {
      const res = await api.get('/shipments?size=50');
      // Filter for unassigned or pending shipments ideally, but for now just load recent
      setShipments(res.data.data?.content || []);
    } catch(err) {
      console.error(err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.post('/delivery/assignments', {
        shipmentId: assignmentForm.shipmentId,
        driverId: assignmentForm.driverId
      });
      setSuccessMsg('Shipment assigned successfully!');
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignmentForm({ shipmentId: '', driverId: '' });
      }, 2000);
    } catch(err) {
      alert(err.response?.data?.message || 'Failed to assign shipment');
    } finally {
      setAssigning(false);
    }
  };

  const activeDrivers = drivers.filter(d => locations[d.id]);
  const center = activeDrivers.length > 0 
    ? [locations[activeDrivers[0].id].latitude, locations[activeDrivers[0].id].longitude] 
    : [40.7128, -74.0060]; // Default to NY

  return (
    <div className='space-y-6 h-[calc(100vh-8rem)] flex flex-col relative'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Fleet & Dispatch</h1>
          <p className='text-gray-500 dark:text-gray-400'>Monitor resources and dispatch drivers.</p>
        </div>
        <div className='flex items-center gap-3'>
          <Button onClick={fetchFleetData} disabled={loading} variant='outline' className='gap-2 hidden sm:flex'>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Map
          </Button>
          <Button onClick={openAssignModal} className='gap-2 shadow-md'>
            <PlusCircle className="h-4 w-4" />
            Assign Shipment
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0'>
        
        {/* Left Pane: Resources */}
        <div className='lg:col-span-1 flex flex-col gap-6 h-full overflow-hidden'>
          


          {/* Drivers Panel */}
          <div className='glass p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden'>
            <h3 className='font-semibold mb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2'>
              <span className='flex items-center gap-2'><User className='h-4 w-4 text-[var(--color-brand)]'/> Drivers</span>
              <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full'>
                {activeDrivers.length} Online
              </span>
            </h3>
            <div className='overflow-y-auto flex-1 space-y-3 pr-1'>
              {drivers.map(d => {
                const isOnline = !!locations[d.id];
                return (
                  <div key={d.id} className='p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm'>
                     <div className='flex justify-between items-center mb-1'>
                       <p className='font-bold text-sm'>{d.driverName}</p>
                       <div className='flex items-center gap-2'>
                          {isOnline ? (
                            <span className='relative flex h-2 w-2'>
                              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                              <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
                            </span>
                          ) : (
                            <div className='h-2 w-2 rounded-full bg-gray-300'></div>
                          )}
                          <span className='text-[10px] text-gray-500 uppercase'>{isOnline ? 'Active' : 'Offline'}</span>
                       </div>
                     </div>
                     <p className='text-xs text-gray-500'>Lic: {d.licenseNumber} • {d.experienceYears} yrs exp</p>
                  </div>
                );
              })}
              {drivers.length === 0 && <p className='text-sm text-gray-500 text-center py-4'>No drivers configured.</p>}
            </div>
          </div>

        </div>

        {/* Right Pane: Map View */}
        <div className='lg:col-span-3 glass rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 relative h-full'>
          <MapContainer center={center} zoom={11} className='h-full w-full absolute inset-0 z-0'>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            {activeDrivers.map(driver => {
              const loc = locations[driver.id];
              return (
                <Marker key={driver.id} position={[loc.latitude, loc.longitude]} icon={deliveryIcon}>
                  <Popup>
                    <div className='font-sans'>
                      <p className='font-bold text-gray-900 m-0 pb-1'>{driver.driverName}</p>
                      <p className='text-xs text-gray-500 m-0 pb-1'>License: {driver.licenseNumber}</p>
                      <p className='text-xs text-gray-400 m-0'>Last ping: {new Date(loc.recordedAt || loc.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Assign Shipment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            {successMsg ? (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{successMsg}</h3>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-[var(--color-brand)]"/> Dispatch Assignment
                </h3>
                <form onSubmit={handleAssignSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Shipment</label>
                    <select
                      required
                      value={assignmentForm.shipmentId}
                      onChange={(e) => setAssignmentForm({...assignmentForm, shipmentId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    >
                      <option value="">-- Choose a Shipment --</option>
                      {shipments.map(s => (
                        <option key={s.id} value={s.id}>{s.trackingNumber} - {s.receiverCity}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Driver</label>
                    <select
                      required
                      value={assignmentForm.driverId}
                      onChange={(e) => setAssignmentForm({...assignmentForm, driverId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    >
                      <option value="">-- Choose a Driver --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.driverName} ({d.licenseNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button type="button" variant="ghost" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={assigning || !assignmentForm.shipmentId || !assignmentForm.driverId}>
                      {assigning ? 'Assigning...' : 'Confirm Dispatch'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default FleetTracking;
