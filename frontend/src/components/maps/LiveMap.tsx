import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon for the driver
const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Delivery motorcycle/truck icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface LiveMapProps {
  route: [number, number][];
  driverName?: string;
  showVehicle?: boolean;
}

export function LiveMap({ route, driverName = 'Driver', showVehicle = true }: LiveMapProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(route[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress when the route changes
    setProgress(0);
    setCurrentPosition(route[0]);
  }, [route]);

  useEffect(() => {
    if (!showVehicle) return;
    // Animate the bike along the route
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.01; // Advance slightly
        if (next >= 1) return 0; // Loop back for demo purposes
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [route]);

  useEffect(() => {
    // Calculate the interpolated position based on progress (0 to 1)
    const totalSegments = route.length - 1;
    const scaledProgress = progress * totalSegments;
    const segmentIndex = Math.floor(scaledProgress);
    const segmentProgress = scaledProgress - segmentIndex;

    if (segmentIndex >= totalSegments) {
      setCurrentPosition(route[totalSegments]);
      return;
    }

    const start = route[segmentIndex];
    const end = route[segmentIndex + 1];

    const lat = start[0] + (end[0] - start[0]) * segmentProgress;
    const lng = start[1] + (end[1] - start[1]) * segmentProgress;

    setCurrentPosition([lat, lng]);
  }, [progress, route]);

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden border border-navy-200 shadow-sm relative z-0">
      <MapContainer 
        center={[18.85, 73.2]} 
        zoom={9} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw the full route */}
        <Polyline positions={route} color="#0ea5e9" weight={4} opacity={0.6} dashArray="10, 10" />

        {/* Origin Marker */}
        <Marker position={route[0]}>
          <Popup>Origin</Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={route[route.length - 1]}>
          <Popup>Destination</Popup>
        </Marker>

        {/* Moving Bike Marker */}
        {showVehicle && (
          <Marker position={currentPosition} icon={vehicleIcon}>
            <Popup>{driverName} is currently here.</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
