import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LiveMap } from '@/components/maps/LiveMap';
import { ShipmentPlanningCard } from './components/ShipmentPlanningCard';
import { Shipment } from '@/types/domain';
import { ShipmentSelectionPanel } from './components/ShipmentSelectionPanel';
import { SelectedShipmentList } from './components/SelectedShipmentList';
import { RouteSummaryPanel } from './components/RouteSummaryPanel';
import { CheckCircle } from 'lucide-react';
import { useDomain } from '@/context/DomainContext';



export function RoutePlanner() {
  const { shipments, drivers, createRoute } = useDomain();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
  
  const [isRouteCreated, setIsRouteCreated] = useState(false);

  // A generic coordinate list representing the planned route
  const routeCoords: [number, number][] = [
    [19.1136, 72.8697], 
    [19.0760, 72.8777], 
    [19.0330, 72.9268], 
    [18.7562, 73.4072], 
    [18.5913, 73.7389],
  ];

  const handleToggleShipment = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setIsOptimized(false);
  };

  const handleReorderShipment = (startIndex: number, endIndex: number) => {
    setSelectedIds(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
    setIsOptimized(false);
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);
    }, 1500);
  };

  const driver = drivers.find(d => d.id === assignedDriverId);
  const derivedVehicle = driver ? driver.vehicle : null;

  const handleCreateRoute = () => {
    if (!assignedDriverId || !derivedVehicle) return;
    
    const selectedLoad = selectedShipments.reduce((sum, s) => sum + s.weightKg, 0);
    if (selectedLoad > derivedVehicle.capacityKg) {
      alert(`Cannot create route. Selected load (${selectedLoad}kg) exceeds vehicle capacity (${derivedVehicle.capacityKg}kg).`);
      return;
    }

    setIsRouteCreated(true);
    
    const routeId = `RT-${Date.now()}`;
    const newRoute = {
      id: routeId,
      name: `Route ${routeId}`,
      driverId: assignedDriverId,
      status: 'Planned' as const,
      origin: 'DC Default',
      destination: 'Multiple Stops',
      estimatedDistanceKm: selectedIds.length * 15.5,
      estimatedDurationMins: selectedIds.length * 25
    };

    const newStops = selectedIds.map((shipmentId, index) => ({
      id: `STP-${Date.now()}-${index}`,
      routeId,
      shipmentId,
      sequence: index + 1,
      status: 'Pending' as const,
      eta: 'TBD'
    }));

    createRoute(newRoute, newStops);
    
    setTimeout(() => {
      setIsRouteCreated(false);
      setSelectedIds([]);
      setAssignedDriverId(null);
      setIsOptimized(false);
    }, 2000);
  };

  const selectedShipments = selectedIds.map(id => shipments.find(s => s.id === id)).filter(Boolean) as Shipment[];

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6 overflow-hidden bg-navy-50">
      {/* Left Panel - Shipments Selection */}
      <ShipmentSelectionPanel 
        shipments={shipments} 
        selectedIds={selectedIds} 
        onToggleShipment={handleToggleShipment} 
      />

      {/* Center - Map */}
      <div className="flex-1 relative flex flex-col hidden lg:flex">
        {isRouteCreated && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-success-500 mb-4" />
              <h2 className="text-xl font-bold text-navy-900">Route Created</h2>
              <p className="text-navy-500 mt-2">The route has been dispatched.</p>
            </div>
          </div>
        )}
        <div className="w-full flex-1">
          <LiveMap route={selectedIds.length > 0 ? routeCoords : []} showVehicle={false} />
        </div>
      </div>

      {/* Right Panel - Summary & Assignment */}
      <div className="hidden md:block w-[400px] shrink-0 border-l border-navy-200 bg-white flex flex-col h-full">
        <RouteSummaryPanel 
          selectedShipments={selectedShipments}
          onRemoveShipment={handleToggleShipment}
          onReorderShipment={handleReorderShipment}
          onOptimize={handleOptimize}
          onCreateRoute={handleCreateRoute}
          isOptimizing={isOptimizing}
          isOptimized={isOptimized}
          assignedDriver={assignedDriverId}
          setAssignedDriver={setAssignedDriverId}
          derivedVehicle={derivedVehicle}
          drivers={drivers}
        />
      </div>
      
      {/* Mobile Footer Overlay */}
      <div className="md:hidden absolute bottom-0 inset-x-0 p-4 bg-white border-t border-navy-200 z-50 flex justify-between items-center">
        <span className="text-sm font-semibold text-navy-900">{selectedIds.length} Shipments Selected</span>
        <Button onClick={handleCreateRoute} disabled={!assignedDriverId || !derivedVehicle || selectedIds.length === 0}>Create Route</Button>
      </div>
    </div>
  );
}
