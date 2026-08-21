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

// Custom origin pickup icon (green)
const originPickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Custom destination/home icon (red/blue pin)
const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Helper component to auto-fit bounds based on shipment origin, destination, and courier location
function MapAutoFitBounds({
  points,
  driverPosition,
}: {
  points: [number, number][];
  driverPosition?: [number, number];
}) {
  const map = useMap();
  const hasFitInitialBoundsRef = useRef(false);

  useEffect(() => {
    const validPoints = points.filter(
      (p) => p && typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1]) && !(p[0] === 0 && p[1] === 0)
    );

    if (validPoints.length >= 2 && !hasFitInitialBoundsRef.current) {
      const bounds = L.latLngBounds(validPoints.map((p) => [p[0], p[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
      hasFitInitialBoundsRef.current = true;
    } else if (validPoints.length === 1 && !hasFitInitialBoundsRef.current) {
      map.setView(validPoints[0], 13, { animate: true });
      hasFitInitialBoundsRef.current = true;
    }
  }, [points, map]);

  // Smoothly pan when live driver GPS updates
  useEffect(() => {
    if (driverPosition && typeof driverPosition[0] === 'number' && typeof driverPosition[1] === 'number') {
      map.panTo(driverPosition, { animate: true, duration: 1 });
    }
  }, [driverPosition, map]);

  return null;
}

interface LiveMapProps {
  originPosition?: [number, number];
  destinationPosition?: [number, number];
  driverPosition?: [number, number];
  route?: [number, number][];
  driverName?: string;
  originAddress?: string;
  destinationAddress?: string;
  accuracy?: number;
  connectionStatus?: 'CONNECTED' | 'CONNECTION_LOST';
  height?: string;
}

export function LiveMap({
  originPosition,
  destinationPosition,
  driverPosition,
  route,
  driverName = 'Courier Driver',
  originAddress,
  destinationAddress,
  accuracy,
  connectionStatus = 'CONNECTED',
  height = 'h-96',
}: LiveMapProps) {
  // Collect all valid positions for dynamic framing
  const allPoints: [number, number][] = [];
  if (originPosition && !isNaN(originPosition[0]) && !isNaN(originPosition[1])) {
    allPoints.push(originPosition);
  }
  if (driverPosition && !isNaN(driverPosition[0]) && !isNaN(driverPosition[1])) {
    allPoints.push(driverPosition);
  }
  if (destinationPosition && !isNaN(destinationPosition[0]) && !isNaN(destinationPosition[1])) {
    allPoints.push(destinationPosition);
  }
  if (route && route.length > 0) {
    route.forEach((p) => {
      if (p && !isNaN(p[0]) && !isNaN(p[1])) allPoints.push(p);
    });
  }

  // Dynamic default center fallback
  const defaultCenter: [number, number] =
    driverPosition ||
    destinationPosition ||
    originPosition ||
    (allPoints.length > 0 ? allPoints[0] : [19.076, 72.8777]);

  // Construct connecting polyline
  let activePolyline: [number, number][] = [];
  if (route && route.length > 0) {
    activePolyline = route;
  } else if (originPosition && driverPosition && destinationPosition) {
    activePolyline = [originPosition, driverPosition, destinationPosition];
  } else if (driverPosition && destinationPosition) {
    activePolyline = [driverPosition, destinationPosition];
  } else if (originPosition && destinationPosition) {
    activePolyline = [originPosition, destinationPosition];
  }

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
          {driverPosition ? (connectionStatus === 'CONNECTED' ? 'Live Telemetry' : 'Connection Paused') : 'Shipment Route'}
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

        {/* Dynamic Bounds & Auto-recenter */}
        <MapAutoFitBounds points={allPoints} driverPosition={driverPosition} />

        {/* Route / Connection Path */}
        {activePolyline.length > 1 && (
          <Polyline
            positions={activePolyline}
            color="#2563eb"
            weight={4}
            opacity={0.75}
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

        {/* Origin Pickup Marker */}
        {originPosition && (
          <Marker position={originPosition} icon={originPickupIcon}>
            <Popup>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-emerald-800">Origin / Pickup</p>
                {originAddress && <p className="text-navy-600">{originAddress}</p>}
                <p className="text-[10px] font-mono text-navy-400">
                  {originPosition[0].toFixed(4)}, {originPosition[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Vehicle Marker */}
        {driverPosition && (
          <Marker position={driverPosition} icon={driverVehicleIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-navy-900">{driverName}</p>
                <p className="text-navy-500">Live GPS Courier</p>
                {accuracy && <p className="text-[10px] text-navy-400">Accuracy: ~{Math.round(accuracy)}m</p>}
                <p className="text-[10px] font-mono text-navy-400">
                  {driverPosition[0].toFixed(4)}, {driverPosition[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationPosition && (
          <Marker position={destinationPosition} icon={destinationIcon}>
            <Popup>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-rose-800">Delivery Destination</p>
                {destinationAddress && <p className="text-navy-600">{destinationAddress}</p>}
                <p className="text-[10px] font-mono text-navy-400">
                  {destinationPosition[0].toFixed(4)}, {destinationPosition[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
