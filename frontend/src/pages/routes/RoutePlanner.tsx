import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Map, Plus, GripVertical, Navigation } from 'lucide-react';

export function RoutePlanner() {
  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6 overflow-hidden bg-navy-50">
      {/* Left Panel - Planner */}
      <div className="w-96 bg-white border-r border-navy-200 flex flex-col z-10 shadow-xl">
        <div className="p-4 border-b border-navy-200">
          <h2 className="text-xl font-semibold text-navy-900">Route Planner</h2>
          <p className="text-sm text-navy-500">Plan delivery sequences</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <Input label="Origin" placeholder="Mumbai Distribution Center" />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-navy-700">Stops</label>
              {[1, 2, 3].map((stop) => (
                <div key={stop} className="flex items-center space-x-2 bg-navy-50 p-2 rounded border border-navy-200">
                  <GripVertical className="h-4 w-4 text-navy-400 cursor-move" />
                  <div className="flex-1 text-sm font-medium">Stop {stop}: Destination {stop}</div>
                  <span className="text-xs bg-white px-2 py-1 rounded text-navy-500 border border-navy-200">
                    14:00 - 16:00
                  </span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Stop
              </Button>
            </div>
            
            <Input label="Destination" placeholder="Pune Business Park" />
          </div>

          <div className="pt-4 border-t border-navy-200 space-y-4">
            <Input label="Assign Driver" placeholder="Select driver" />
            <Input label="Assign Vehicle" placeholder="Select vehicle" />
          </div>
        </div>
        
        <div className="p-4 border-t border-navy-200 bg-navy-50">
          <Button className="w-full mb-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
            <Navigation className="h-4 w-4 mr-2" /> Optimize Route
          </Button>
          <Button variant="outline" className="w-full">Save Route</Button>
        </div>
      </div>

      {/* Center - Map */}
      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10 w-64">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-navy-900 border-b border-navy-100 pb-2">Route Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Total Distance</span>
                <span className="font-medium">142.5 km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Est. Duration</span>
                <span className="font-medium">3h 45m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Stops</span>
                <span className="font-medium">3</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full h-full bg-navy-100 flex items-center justify-center">
          <Map className="h-24 w-24 text-navy-300 mx-auto" />
          <p className="text-navy-400 font-medium ml-4">Interactive Map (Planner)</p>
        </div>
      </div>
    </div>
  );
}
