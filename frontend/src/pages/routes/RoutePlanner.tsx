import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Map, Plus, GripVertical, Navigation, Trash2, CheckCircle } from 'lucide-react';
import { LiveMap } from '@/components/maps/LiveMap';

export function RoutePlanner() {
  const [stops, setStops] = useState([
    { id: 1, name: 'Warehouse A (Pickup)' },
    { id: 2, name: 'Client B (Dropoff)' },
    { id: 3, name: 'Facility C (Pickup)' },
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  // A generic coordinate list representing the planned route
  const routeCoords: [number, number][] = [
    [19.1136, 72.8697], 
    [19.0760, 72.8777], 
    [19.0330, 72.9268], 
    [18.7562, 73.4072], 
    [18.5913, 73.7389],
  ];

  const handleAddStop = () => {
    setStops([...stops, { id: Date.now(), name: `New Stop ${stops.length + 1}` }]);
    setIsOptimized(false);
  };

  const handleRemoveStop = (id: number) => {
    setStops(stops.filter(s => s.id !== id));
    setIsOptimized(false);
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    // Simulate API call for route optimization
    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);
      // In a real app, this would reorder the stops array based on the API response.
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6 overflow-hidden bg-navy-50">
      {/* Left Panel - Planner */}
      <div className="w-96 bg-white border-r border-navy-200 flex flex-col z-10 shadow-xl">
        <div className="p-4 border-b border-navy-200">
          <h2 className="text-xl font-semibold text-navy-900">Route Planner</h2>
          <p className="text-sm text-navy-500">Plan and optimize delivery sequences</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <Input label="Origin" defaultValue="Mumbai Distribution Center" />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-navy-700">Stops</label>
              {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center space-x-2 bg-navy-50 p-2 rounded border border-navy-200 group">
                  <GripVertical className="h-4 w-4 text-navy-400 cursor-move shrink-0" />
                  <div className="flex-1 text-sm font-medium truncate">{index + 1}. {stop.name}</div>
                  <button 
                    onClick={() => handleRemoveStop(stop.id)}
                    className="opacity-0 group-hover:opacity-100 text-navy-400 hover:text-danger-500 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" size="sm" onClick={handleAddStop}>
                <Plus className="h-4 w-4 mr-2" /> Add Stop
              </Button>
            </div>
            
            <Input label="Destination" defaultValue="Pune Business Park" />
          </div>

          <div className="pt-4 border-t border-navy-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Assign Fleet Unit (Vehicle + Driver)</label>
              <select className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="">Select a vehicle...</option>
                <option value="v1">MH-12-AB-4821 (Driver: Rahul Sharma)</option>
                <option value="v2">DL-4C-AF-2938 (Driver: Amit Patel)</option>
                <option value="v3">KA-01-MJ-9912 (Driver: Suresh Kumar)</option>
              </select>
              <p className="text-xs text-navy-500 mt-1">Assigning a vehicle automatically assigns its permanently linked driver.</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-navy-200 bg-navy-50 space-y-2">
          {isOptimized && (
            <div className="bg-success-50 text-success-700 text-sm p-2 rounded border border-success-200 flex items-center mb-2">
              <CheckCircle className="h-4 w-4 mr-2 shrink-0" /> Route optimized successfully! Saving 12km.
            </div>
          )}
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            onClick={handleOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> Optimizing...</span>
            ) : (
              <span className="flex items-center"><Navigation className="h-4 w-4 mr-2" /> Optimize Route</span>
            )}
          </Button>
          <Button variant="outline" className="w-full">Save Route</Button>
        </div>
      </div>

      {/* Center - Map */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-4 right-4 z-[400] w-64 pointer-events-none">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur pointer-events-auto">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-navy-900 border-b border-navy-100 pb-2">Route Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Total Distance</span>
                <span className={`font-medium ${isOptimized ? 'text-success-600' : ''}`}>
                  {isOptimized ? '130.5 km' : '142.5 km'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Est. Duration</span>
                <span className={`font-medium ${isOptimized ? 'text-success-600' : ''}`}>
                  {isOptimized ? '3h 15m' : '3h 45m'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Stops</span>
                <span className="font-medium">{stops.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full flex-1">
          <LiveMap route={routeCoords} showVehicle={false} />
        </div>
      </div>
    </div>
  );
}
