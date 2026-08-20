import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle/courier icon for the driver
const driverVehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});

// Custom destination/home icon
const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Helper component to auto-recenter map when driver position changes
function MapAutoRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

interface LiveMapProps {
  driverPosition?: [number, number];
  destinationPosition?: [number, number];
  route?: [number, number][];
  driverName?: string;
  accuracy?: number;
  connectionStatus?: 'CONNECTED' | 'CONNECTION_LOST';
  height?: string;
}

export function LiveMap({
  driverPosition,
  destinationPosition,
  route,
  driverName = 'Courier Driver',
  accuracy,
  connectionStatus = 'CONNECTED',
  height = 'h-96',
}: LiveMapProps) {
  // Default coordinates (Pune/Mumbai region) if no GPS yet
  const defaultCenter: [number, number] = driverPosition || destinationPosition || (route && route.length > 0 ? route[0] : [18.5204, 73.8567]);

  // Construct connecting polyline if both driver and destination exist
  const activePolyline: [number, number][] = 
    route && route.length > 0 
      ? route 
      : driverPosition && destinationPosition 
        ? [driverPosition, destinationPosition] 
        : [];

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden border border-navy-200 shadow-sm relative z-0`}>
      {/* Live Status Overlay Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-navy-100 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <span className="text-xs font-semibold text-navy-800">
          {connectionStatus === 'CONNECTED' ? 'Live Telemetry' : 'Connection Paused'}
        </span>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {driverPosition && <MapAutoRecenter center={driverPosition} />}

        {/* Route / Connection Path */}
        {activePolyline.length > 1 && (
          <Polyline
            positions={activePolyline}
            color="#2563eb"
            weight={4}
            opacity={0.7}
            dashArray="8, 8"
          />
        )}

        {/* GPS Accuracy Circle */}
        {driverPosition && accuracy && (
          <Circle
            center={driverPosition}
            radius={Math.min(accuracy, 200)}
            pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.15, stroke: false }}
          />
        )}

        {/* Driver Vehicle Marker */}
        {driverPosition && (
          <Marker position={driverPosition} icon={driverVehicleIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-navy-900">{driverName}</p>
                <p className="text-navy-500">Live GPS Location</p>
                {accuracy && <p className="text-[10px] text-navy-400">Accuracy: ~{Math.round(accuracy)}m</p>}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationPosition && (
          <Marker position={destinationPosition} icon={destinationIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-navy-900">Delivery Destination</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
