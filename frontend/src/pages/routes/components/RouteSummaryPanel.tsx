import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Navigation, Users, CheckCircle, Car } from 'lucide-react';
import { ShipmentData } from '@/services/mockData';
import { SelectedShipmentList } from './SelectedShipmentList';

interface RouteSummaryPanelProps {
  selectedShipments: ShipmentData[];
  onRemoveShipment: (id: string) => void;
  onReorderShipment: (start: number, end: number) => void;
  onOptimize: () => void;
  onCreateRoute: () => void;
  isOptimizing: boolean;
  isOptimized: boolean;
  assignedDriver: string | null;
  setAssignedDriver: (driver: string) => void;
  assignedVehicle: string | null;
  setAssignedVehicle: (vehicle: string) => void;
}

export function RouteSummaryPanel({ 
  selectedShipments,
  onRemoveShipment,
  onReorderShipment,
  onOptimize, 
  onCreateRoute,
  isOptimizing, 
  isOptimized, 
  assignedDriver,
  setAssignedDriver,
  assignedVehicle,
  setAssignedVehicle
}: RouteSummaryPanelProps) {
  
  const estimatedDistance = selectedShipments.length * 15.5; // dummy calc
  const estimatedTime = selectedShipments.length * 25; // dummy calc in minutes

  const formatTime = (mins: number) => {
    if (mins === 0) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-navy-200 shadow-sm z-10 w-full">
      <div className="p-4 border-b border-navy-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">Route Summary</h2>
          <p className="text-sm text-navy-500">Plan and dispatch</p>
        </div>
        <Badge variant="info">Draft</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <Card className="border-navy-100 shadow-none bg-navy-50/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-navy-600">Total Stops</span>
              <span className="font-semibold text-navy-900">{selectedShipments.length > 0 ? selectedShipments.length + 1 : 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-navy-600">Est. Distance</span>
              <span className={`font-semibold ${isOptimized ? 'text-success-600' : 'text-navy-900'}`}>
                {selectedShipments.length === 0 ? '0 km' : `${(isOptimized ? estimatedDistance * 0.8 : estimatedDistance).toFixed(1)} km`}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-navy-600">Est. Duration</span>
              <span className={`font-semibold ${isOptimized ? 'text-success-600' : 'text-navy-900'}`}>
                {selectedShipments.length === 0 ? '0h 0m' : formatTime(isOptimized ? estimatedTime * 0.85 : estimatedTime)}
              </span>
            </div>
          </CardContent>
        </Card>

        {selectedShipments.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-navy-100 pb-1">
              <h3 className="text-sm font-semibold text-navy-900">Selected Shipments ({selectedShipments.length})</h3>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2">
              <SelectedShipmentList 
                selectedShipments={selectedShipments}
                onRemove={onRemoveShipment}
                onReorder={onReorderShipment}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Fleet Assignment</h3>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Assign Driver</label>
            <select 
              className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm mb-3"
              value={assignedDriver || ''}
              onChange={(e) => setAssignedDriver(e.target.value)}
            >
              <option value="" disabled>Select a driver...</option>
              <option value="Rahul Sharma">Rahul Sharma</option>
              <option value="Amit Patel">Amit Patel</option>
              <option value="Suresh Kumar">Suresh Kumar</option>
            </select>

            <label className="block text-sm font-medium text-navy-700 mb-1">Assign Vehicle</label>
            <select 
              className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm mb-2"
              value={assignedVehicle || ''}
              onChange={(e) => setAssignedVehicle(e.target.value)}
            >
              <option value="" disabled>Select a vehicle...</option>
              <option value="MH-12-AB-4821">MH-12-AB-4821 (Heavy Truck)</option>
              <option value="DL-4C-AF-2938">DL-4C-AF-2938 (Medium Truck)</option>
              <option value="KA-01-MJ-9912">KA-01-MJ-9912 (Refrigerated)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-navy-200 space-y-3 bg-navy-50">
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          onClick={onOptimize}
          disabled={isOptimizing || selectedShipments.length < 2}
        >
          {isOptimizing ? (
            <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> Optimizing...</span>
          ) : isOptimized ? (
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Route Optimized</span>
          ) : (
            <span className="flex items-center"><Navigation className="h-4 w-4 mr-2" /> Optimize Sequence</span>
          )}
        </Button>
        
        <Button 
          className="w-full bg-primary-600 hover:bg-primary-700 text-white border-0" 
          onClick={onCreateRoute}
          disabled={!assignedDriver || selectedShipments.length === 0}
        >
          Dispatch Route
        </Button>
      </div>
    </div>
  );
}
