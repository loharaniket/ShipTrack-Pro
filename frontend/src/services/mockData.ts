export const MOCK_SHIPMENTS = [
  {
    id: 'STP-2026-10482',
    origin: 'Mumbai Distribution Center',
    destination: 'Pune Business Park',
    status: 'Out for Delivery',
    driver: 'Rahul Sharma',
    vehicle: 'MH-12-AB-4821',
    eta: '10:42 AM',
    progress: 78,
    distanceRemaining: '23.4 km'
  }
];

export const generateMockTelemetry = () => {
  return {
    speed: Math.floor(Math.random() * (60 - 30) + 30) + ' km/h',
    heading: Math.floor(Math.random() * 360) + '°'
  };
};
