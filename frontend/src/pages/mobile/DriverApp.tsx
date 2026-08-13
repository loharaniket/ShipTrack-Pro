import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Map, Navigation, CheckCircle, Camera, PenTool, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// This simulates a mobile driver experience. In a real app, this would be responsive or a React Native app.
export function DriverApp() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [actionState, setActionState] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setActionState(action);
    setTimeout(() => setActionState(null), 1500);
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 h-[800px] border-[8px] border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col">
      {/* Mobile Status Bar Simulation */}
      <div className="h-7 bg-navy-900 w-full flex justify-between items-center px-6 text-white text-[10px] font-medium">
        <span>9:41</span>
        <div className="flex space-x-1">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      <div className="bg-navy-900 text-white p-4 flex items-center justify-between pb-6">
        <div>
          <h2 className="font-bold text-lg">Current Route</h2>
          <p className="text-sm text-navy-300">{isCompleted ? '2' : '3'} stops remaining</p>
        </div>
        <div className="h-10 w-10 bg-navy-800 rounded-full flex items-center justify-center">
          <span className="font-bold">RS</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-3 relative">
        {actionState && (
          <div className="absolute top-4 left-4 right-4 bg-navy-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-center font-medium animate-in fade-in slide-in-from-top-4">
            {actionState} Saved
          </div>
        )}

        {isCompleted ? (
          <Card className="mt-8 shadow-md border-0 bg-success-50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-16 w-16 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-navy-900 text-xl">Delivery Completed!</h3>
              <p className="text-navy-600">Great job. Generating your next stop...</p>
              <Button className="w-full mt-4" onClick={() => setIsCompleted(false)}>Load Next Stop</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-4 shadow-md border-0">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="info" className="mb-2">Next Stop</Badge>
                    <h3 className="font-bold text-navy-900 text-lg">Acme Retail</h3>
                    <p className="text-sm text-navy-500">STP-2026-10482</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600 text-xl">14 min</p>
                    <p className="text-xs text-navy-500">2.4 km</p>
                  </div>
                </div>
                
                <div className="bg-navy-50 p-3 rounded-lg flex items-start space-x-3 text-sm text-navy-700">
                  <Navigation className="h-5 w-5 text-navy-400 flex-shrink-0" />
                  <p>Pune Business Park, Hinjewadi Phase 1, Building A, Pune 411057</p>
                </div>

                <Button size="lg" className="w-full h-14 text-lg bg-navy-900 hover:bg-navy-800" onClick={() => handleAction('Navigation Started')}>
                  <Navigation className="h-5 w-5 mr-2" /> Start Navigation
                </Button>
              </CardContent>
            </Card>

            <h4 className="font-semibold text-navy-900 mb-3 ml-1">Delivery Actions</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2 border-navy-200 bg-white shadow-sm hover:bg-navy-50 transition-colors"
                onClick={() => handleAction('Photo')}
              >
                <Camera className="h-6 w-6 text-navy-500" />
                <span>Take Photo</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2 border-navy-200 bg-white shadow-sm hover:bg-navy-50 transition-colors"
                onClick={() => handleAction('Signature')}
              >
                <PenTool className="h-6 w-6 text-navy-500" />
                <span>Signature</span>
              </Button>
            </div>

            <Button size="lg" className="w-full h-14 text-lg bg-success-500 hover:bg-success-600" onClick={handleComplete}>
              <CheckCircle className="h-5 w-5 mr-2" /> Complete Delivery
            </Button>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="h-16 bg-white border-t border-navy-200 flex items-center justify-around text-navy-400 text-xs shrink-0">
        <div className="flex flex-col items-center text-primary-600">
          <Map className="h-6 w-6 mb-1" />
          <span>Route</span>
        </div>
        <div className="flex flex-col items-center hover:text-navy-600 cursor-pointer transition-colors" onClick={() => handleAction('Completed View')}>
          <CheckCircle className="h-6 w-6 mb-1" />
          <span>Completed</span>
        </div>
        <div className="flex flex-col items-center hover:text-navy-600 cursor-pointer transition-colors" onClick={() => handleAction('Issues View')}>
          <AlertTriangle className="h-6 w-6 mb-1" />
          <span>Issues</span>
        </div>
      </div>
    </div>
  );
}
