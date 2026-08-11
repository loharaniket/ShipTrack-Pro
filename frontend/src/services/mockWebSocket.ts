import { useState, useEffect } from 'react';

export function useLiveSimulation() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [telemetry, setTelemetry] = useState({ speed: '0 km/h', distance: '0 km' });

  useEffect(() => {
    // Simulate connection delay
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1500);

    // Simulate telemetry updates
    const interval = setInterval(() => {
      setTelemetry({
        speed: Math.floor(Math.random() * 20 + 30) + ' km/h',
        distance: (Math.random() * 5 + 15).toFixed(1) + ' km'
      });
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return { connectionStatus, telemetry };
}
