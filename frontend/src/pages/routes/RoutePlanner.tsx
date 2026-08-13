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
      
      {/* Left Panel - Dynamic Steps */}
      {currentStep === 1 && (
        <ShipmentSelectionPanel 
          shipments={MOCK_SHIPMENTS} 
          selectedIds={selectedIds} 
          onToggleShipment={handleToggleShipment} 
        />
      )}

      {currentStep === 2 && (
        <div className="flex flex-col h-full bg-white border-r border-navy-200 shadow-sm z-10 w-96 shrink-0">
          <div className="p-4 border-b border-navy-200">
            <h2 className="text-xl font-semibold text-navy-900">Step 2: Sequence Route</h2>
            <p className="text-sm text-navy-500 mb-4">Review and reorder the selected stops</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-navy-50">
            <SelectedShipmentList 
              selectedShipments={selectedShipments}
              onRemove={handleToggleShipment}
              onReorder={handleReorderShipment}
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col h-full bg-white border-r border-navy-200 shadow-sm z-10 w-96 shrink-0">
          <div className="p-4 border-b border-navy-200">
            <h2 className="text-xl font-semibold text-navy-900">Step 3: Assign Fleet Unit</h2>
            <p className="text-sm text-navy-500 mb-4">Select the vehicle and driver for this route</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-navy-50 space-y-6">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Assign Fleet Unit (Vehicle + Driver)</label>
              <select 
                className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={assignedDriver || ''}
                onChange={(e) => setAssignedDriver(e.target.value)}
              >
                <option value="" disabled>Select a vehicle...</option>
                <option value="Rahul Sharma (MH-12-AB-4821)">MH-12-AB-4821 (Driver: Rahul Sharma)</option>
                <option value="Amit Patel (DL-4C-AF-2938)">DL-4C-AF-2938 (Driver: Amit Patel)</option>
                <option value="Suresh Kumar (KA-01-MJ-9912)">KA-01-MJ-9912 (Driver: Suresh Kumar)</option>
              </select>
              <p className="text-xs text-navy-500 mt-2">Assigning a vehicle automatically assigns its permanently linked driver. Do not assign them separately.</p>
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 4 && (
        <div className="flex flex-col h-full bg-white border-r border-navy-200 shadow-sm z-10 w-96 shrink-0">
          <div className="p-4 border-b border-navy-200">
            <h2 className="text-xl font-semibold text-navy-900">Step 4: Confirm</h2>
            <p className="text-sm text-navy-500 mb-4">Final review of the drafted route</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-navy-50 flex items-center justify-center">
             <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900">Route Ready</h3>
                <p className="text-sm text-navy-600">The route is ready to be dispatched to {assignedDriver ? assignedDriver.split('(')[0] : 'the driver'}.</p>
             </div>
          </div>
        </div>
      )}

      {/* Center - Map */}
      <div className="flex-1 relative flex flex-col hidden lg:flex">
        {isRouteCreated && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-success-500 mb-4" />
              <h2 className="text-xl font-bold text-navy-900">Route Created</h2>
              <p className="text-navy-500 mt-2">The driver has been notified.</p>
            </div>
          </div>
        )}
        <div className="w-full flex-1">
          <LiveMap route={selectedIds.length > 0 ? routeCoords : []} showVehicle={false} />
        </div>
      </div>

      {/* Right Panel - Summary */}
      <div className="hidden md:block">
        <RouteSummaryPanel 
          selectedShipments={selectedShipments}
          onOptimize={handleOptimize}
          onCreateRoute={handleCreateRoute}
          isOptimizing={isOptimizing}
          isOptimized={isOptimized}
          assignedDriver={assignedDriver}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNextStep={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
          onPrevStep={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          onAssignDriver={() => setCurrentStep(3)}
        />
      </div>
      
      {/* Mobile Footer Overlay */}
      <div className="md:hidden absolute bottom-0 inset-x-0 p-4 bg-white border-t border-navy-200 z-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-navy-900">{selectedIds.length} Shipments</span>
          <span className="text-sm text-navy-500">Step {currentStep} of {totalSteps}</span>
        </div>
        <div className="flex space-x-2">
           {currentStep > 1 && (
             <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>Back</Button>
           )}
           {currentStep < totalSteps ? (
             <Button className="flex-1" onClick={() => setCurrentStep(prev => prev + 1)} disabled={selectedIds.length === 0}>Continue</Button>
           ) : (
             <Button className="flex-1" onClick={handleCreateRoute} disabled={!assignedDriver}>Create Route</Button>
           )}
        </div>
      </div>
    </div>
  );
}
