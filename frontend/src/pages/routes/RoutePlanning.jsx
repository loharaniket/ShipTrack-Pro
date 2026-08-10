import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { User, Package, Plus, MapPin, XCircle, ArrowRight } from 'lucide-react';

const RoutePlanning = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [driversRes, shipmentsRes] = await Promise.all([
        api.get('/delivery/drivers'),
        api.get('/shipments')
      ]);
      
      setDrivers(driversRes.data.data || []);
      
      // Filter shipments that are ready/unassigned
      const allShipments = shipmentsRes.data.data?.content || [];
      const available = allShipments.filter(s => s.status === 'CREATED' || s.status === 'PENDING');
      setShipments(available.length > 0 ? available : allShipments);
      
    } catch (error) {
      console.error("Failed to fetch data for route planning", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
  };

  const addShipmentToRoute = (shipment) => {
    if (!routeStops.find(s => s.id === shipment.id)) {
      setRouteStops([...routeStops, shipment]);
    }
  };

  const removeShipmentFromRoute = (shipmentId) => {
    setRouteStops(routeStops.filter(s => s.id !== shipmentId));
  };

  const handleCreateRoute = async () => {
    if (!selectedDriver || routeStops.length === 0) {
      alert("Please select a driver and at least one shipment.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        driverId: selectedDriver.id,
        shipmentIds: routeStops.map(s => s.id)
      };
      
      await api.post('/routes', payload);
      alert("Route created successfully!");
      navigate('/admin/routes/active');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create route');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading resources...</div>;
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-7rem)] overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Route Planning</h1>
        <p className="text-gray-500 dark:text-gray-400">Click a driver and assign shipments to build a route.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Column: Available Resources (Stacked Lists) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          
          {/* List A: Drivers */}
          <div className="glass p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-1/2 overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <User className="h-5 w-5 text-blue-500" /> Available Drivers
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{drivers.length}</span>
            </h3>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {drivers.map(d => (
                <div 
                  key={d.id} 
                  onClick={() => handleDriverClick(d)}
                  className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                    selectedDriver?.id === d.id 
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 shadow-md ring-1 ring-[var(--color-brand)]' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{d.driverName}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">Lic: {d.licenseNumber}</p>
                  </div>
                  {selectedDriver?.id === d.id && (
                    <div className="h-6 w-6 bg-[var(--color-brand)] rounded-full flex items-center justify-center text-white">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {drivers.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No drivers available</p>}
            </div>
          </div>

          {/* List B: Shipments */}
          <div className="glass p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-1/2 overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Package className="h-5 w-5 text-emerald-500" /> Unassigned Shipments
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{shipments.length}</span>
            </h3>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {shipments.map(s => {
                const isAdded = routeStops.some(rs => rs.id === s.id);
                return (
                  <div key={s.id} className={`p-3 border rounded-xl flex justify-between items-center shadow-sm transition-opacity ${isAdded ? 'opacity-50 bg-gray-50 dark:bg-gray-900 border-gray-100' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:shadow-md'}`}>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{s.trackingNumber}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3"/>{s.receiverCity}</p>
                    </div>
                    <Button 
                      variant={isAdded ? 'outline' : 'primary'} 
                      size="sm" 
                      onClick={() => addShipmentToRoute(s)} 
                      disabled={isAdded}
                      className={!isAdded ? 'bg-emerald-500 hover:bg-emerald-600 border-none' : ''}
                    >
                      {isAdded ? 'Added' : <><Plus className="h-4 w-4" /> Add</>}
                    </Button>
                  </div>
                );
              })}
              {shipments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No available shipments</p>}
            </div>
          </div>

        </div>

        {/* Right Column: Route Builder Canvas */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden border border-gray-200 dark:border-gray-800">
          
          {/* Driver Slot */}
          <div className="mb-6 shrink-0">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Selected Driver</h2>
            {selectedDriver ? (
              <div className="bg-gradient-to-r from-[var(--color-brand)] to-blue-600 rounded-2xl p-4 text-white shadow-lg flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm">
                    {selectedDriver.driverName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedDriver.driverName}</h3>
                    <p className="text-sm text-blue-100 flex items-center gap-1">
                       License: <span className="font-mono">{selectedDriver.licenseNumber}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedDriver(null)} className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 text-center text-gray-400">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click a driver from the left column to lock them in.</p>
              </div>
            )}
          </div>

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 shrink-0">Route Itinerary</h2>
          
          {/* Drop Zone / Route Stops */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 overflow-y-auto mb-6 shadow-inner relative">
            {routeStops.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 absolute inset-0">
                <Package className="h-10 w-10 mb-3 opacity-30 text-[var(--color-brand)]" />
                <p className="font-medium">No shipments assigned yet.</p>
                <p className="text-sm mt-1">Click "Add" on shipments in the left column.</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>
                {routeStops.map((stop, index) => (
                  <div key={stop.id} className="relative z-10 flex gap-4 items-center group">
                    <div className="h-12 w-12 rounded-full bg-[var(--color-brand)] text-white border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center font-bold text-lg shadow-md shrink-0 transition-transform group-hover:scale-110">
                      {index + 1}
                    </div>
                    <div className="flex-1 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex justify-between items-center transition-shadow group-hover:shadow-md">
                      <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">{stop.trackingNumber}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                           <MapPin className="h-4 w-4 text-[var(--color-brand)]" /> {stop.receiverCity}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeShipmentFromRoute(stop.id)} 
                        className="text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4"/> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg" 
              onClick={handleCreateRoute}
              disabled={submitting || routeStops.length === 0 || !selectedDriver}
            >
              {submitting ? 'Creating Route...' : `Create Route with ${routeStops.length} Stops`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
