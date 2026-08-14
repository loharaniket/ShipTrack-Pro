import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LiveMap } from '@/components/maps/LiveMap';
import { ShipmentPlanningCard, ShipmentData } from './components/ShipmentPlanningCard';
import { ShipmentSelectionPanel } from './components/ShipmentSelectionPanel';
import { SelectedShipmentList } from './components/SelectedShipmentList';
import { RouteSummaryPanel } from './components/RouteSummaryPanel';
import { CheckCircle } from 'lucide-react';

const MOCK_SHIPMENTS: ShipmentData[] = [
  { id: 'SHP-10025', customer: 'ABC Company', pickup: 'Mumbai Warehouse', delivery: 'Pune', distance: '145 km', priority: 'High', deadline: 'Today 18:00', status: 'Available', packageCount: 25 },
  { id: 'SHP-10026', customer: 'Nova Electronics', pickup: 'Mumbai South', delivery: 'Navi Mumbai', distance: '32 km', priority: 'Urgent', deadline: 'Today 14:00', status: 'Available', packageCount: 5 },
  { id: 'SHP-10027', customer: 'UrbanCart', pickup: 'Thane', delivery: 'Kalyan', distance: '28 km', priority: 'Standard', deadline: 'Tomorrow 10:00', status: 'Already Planned', assignedTo: 'R-102', packageCount: 12 },
  { id: 'SHP-10028', customer: 'Acme Retail', pickup: 'Andheri', delivery: 'Bandra', distance: '12 km', priority: 'Standard', deadline: 'Today 20:00', status: 'Available', packageCount: 8 },
  { id: 'SHP-10029', customer: 'Global Supply', pickup: 'Mumbai Airport', delivery: 'Vashi', distance: '22 km', priority: 'High', deadline: 'Tomorrow 12:00', status: 'Assigned', assignedTo: 'John', packageCount: 40 },
  { id: 'SHP-10030', customer: 'Local Mart', pickup: 'Dadar', delivery: 'Worli', distance: '5 km', priority: 'Standard', deadline: 'Today 16:00', status: 'Completed', packageCount: 2 },
];

export function RoutePlanner() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [assignedDriver, setAssignedDriver] = useState<string | null>(null);
  
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

  const handleCreateRoute = () => {
    setIsRouteCreated(true);
    // Real implementation would POST to backend and reset or navigate
    setTimeout(() => {
      setIsRouteCreated(false);
      setSelectedIds([]);
      setCurrentStep(1);
      setAssignedDriver(null);
      setIsOptimized(false);
      // alert("Route Created");
    }, 2000);
  };

  // Reorder MOCK_SHIPMENTS to match selectedIds order for the SelectedShipmentList
  const selectedShipments = selectedIds.map(id => MOCK_SHIPMENTS.find(s => s.id === id)).filter(Boolean) as ShipmentData[];

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6 overflow-hidden bg-navy-50">
      {/* Left Panel - Shipments Selection */}
      <ShipmentSelectionPanel 
        shipments={MOCK_SHIPMENTS} 
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
          assignedDriver={assignedDriver}
          setAssignedDriver={setAssignedDriver}
        />
      </div>
      
      {/* Mobile Footer Overlay */}
      <div className="md:hidden absolute bottom-0 inset-x-0 p-4 bg-white border-t border-navy-200 z-50 flex justify-between items-center">
        <span className="text-sm font-semibold text-navy-900">{selectedIds.length} Shipments Selected</span>
        <Button onClick={handleCreateRoute} disabled={!assignedDriver || selectedIds.length === 0}>Create Route</Button>
      </div>
    </div>
  );
}
