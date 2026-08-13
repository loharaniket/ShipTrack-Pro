import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Navigation, Users, CheckCircle, Car } from 'lucide-react';
import { ShipmentData } from './ShipmentPlanningCard';

interface RouteSummaryPanelProps {
  selectedShipments: ShipmentData[];
  onOptimize: () => void;
  onAssignDriver: () => void;
  onCreateRoute: () => void;
  isOptimizing: boolean;
  isOptimized: boolean;
  assignedDriver: string | null;
  currentStep: number;
  totalSteps: number;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export function RouteSummaryPanel({ 
  selectedShipments, 
  onOptimize, 
  onCreateRoute,
  isOptimizing, 
  isOptimized, 
  assignedDriver,
  currentStep,
  totalSteps,
  onNextStep,
  onPrevStep
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
    <div className="flex flex-col h-full bg-white border-l border-navy-200 shadow-sm z-10 w-80 shrink-0">
      <div className="p-4 border-b border-navy-200">
        <h2 className="text-xl font-semibold text-navy-900">Route Summary</h2>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="info">Draft</Badge>
          <span className="text-xs text-navy-500">Step {currentStep} of {totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="border-navy-100 shadow-none bg-navy-50/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-navy-600">Selected Shipments</span>
              <span className="font-semibold text-navy-900">{selectedShipments.length}</span>
            </div>
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

        {currentStep >= 3 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Fleet Assignment</h3>
            <div className="bg-white border border-navy-200 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-navy-100 p-1.5 rounded-full text-navy-600 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-navy-500">Driver</p>
                  <p className="text-sm font-medium text-navy-900 truncate">
                    {assignedDriver ? assignedDriver.split('(')[0].trim() : 'Not Assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-navy-100 p-1.5 rounded-full text-navy-600 shrink-0">
                  <Car className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-navy-500">Vehicle</p>
                  <p className="text-sm font-medium text-navy-900 truncate">
                    {assignedDriver ? (assignedDriver.includes('(') ? assignedDriver.split('(')[1].replace(')', '') : 'Assigned') : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-navy-200 space-y-3 bg-navy-50">
        {currentStep === 2 && (
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
              <span className="flex items-center"><Navigation className="h-4 w-4 mr-2" /> Optimize Route</span>
            )}
          </Button>
        )}
        
        <div className="flex space-x-2">
          {currentStep > 1 && (
            <Button variant="outline" className="w-1/3" onClick={onPrevStep}>
              Back
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button 
              className={currentStep === 1 ? "w-full" : "flex-1"} 
              onClick={onNextStep}
              disabled={selectedShipments.length === 0}
            >
              Continue
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white border-0" 
              onClick={onCreateRoute}
              disabled={!assignedDriver}
            >
              Create Route
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
