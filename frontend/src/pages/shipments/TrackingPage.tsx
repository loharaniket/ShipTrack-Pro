import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Map, Navigation, Truck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function TrackingPage() {
  const { id } = useParams();

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6 overflow-hidden bg-white">
      {/* Interactive Map Area */}
      <div className="flex-1 bg-navy-100 relative">
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="success" className="bg-white/90 shadow text-sm py-1.5 px-3">
            <span className="h-2 w-2 rounded-full bg-success-500 mr-2 animate-pulse inline-block" />
            Live Tracking Connected
          </Badge>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          {/* Replace with actual react-leaflet or google-maps map */}
          <div className="text-center">
            <Map className="h-24 w-24 text-navy-300 mx-auto" />
            <p className="text-navy-500 mt-4 font-medium">Interactive Map rendering for {id}</p>
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      <div className="w-96 border-l border-navy-200 bg-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-navy-200">
          <h2 className="text-xl font-bold text-navy-900">{id}</h2>
          <p className="text-sm text-navy-500 mt-1">Acme Retail</p>
          
          <div className="mt-6 bg-navy-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-navy-500">Current Status</span>
              <Badge variant="info">In Transit</Badge>
            </div>
            <div className="mt-4 flex items-center">
              <Clock className="h-5 w-5 text-primary-500 mr-2" />
              <div>
                <p className="text-xs text-navy-500">Updated ETA</p>
                <p className="font-bold text-navy-900 text-lg">2:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-navy-900 mb-3 uppercase tracking-wider">Live Telemetry</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-navy-200 rounded p-3">
                <p className="text-xs text-navy-500">Speed</p>
                <p className="font-semibold text-navy-900">42 km/h</p>
              </div>
              <div className="bg-white border border-navy-200 rounded p-3">
                <p className="text-xs text-navy-500">Distance Rem.</p>
                <p className="font-semibold text-navy-900">23.4 km</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-900 mb-3 uppercase tracking-wider">Vehicle Details</h3>
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-navy-400 mr-3" />
              <div>
                <p className="font-medium text-navy-900">MH-12-AB-4821</p>
                <p className="text-xs text-navy-500">Driver: Rahul Sharma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
