import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Map, Users, AlertTriangle, Truck, CheckCircle2, BellRing, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LogisticsOperatorDashboard() {
  const [events, setEvents] = useState([
    { id: 1, text: 'Shipment ST-10492 entered Mumbai distribution zone.', time: '2 mins ago', type: 'info' },
    { id: 2, text: 'ETA updated by +14 mins for Route 8B.', time: '5 mins ago', type: 'warning' },
    { id: 3, text: 'Driver Rahul deviated from planned route.', time: '12 mins ago', type: 'danger' },
    { id: 4, text: 'Delivery completed for ST-10288.', time: '15 mins ago', type: 'success' },
  ]);

  const handleAcknowledge = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleTriggerAlert = () => {
    const alerts = ['Traffic delay on Route 4', 'Vehicle breakdown reported', 'New high-priority pickup'];
    const type = ['warning', 'danger', 'info'][Math.floor(Math.random() * 3)];
    setEvents([{
      id: Date.now(),
      text: alerts[Math.floor(Math.random() * alerts.length)],
      time: 'Just now',
      type
    }, ...events]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: 'Active Shipments', value: '1,248', icon: Truck, link: '/shipments' },
          { label: 'Out for Delivery', value: '432', icon: Truck, link: '/operations' },
          { label: 'Drivers Active', value: '380', icon: Users, link: '/drivers' },
          { label: 'Vehicles Active', value: '395', icon: Truck, link: '/drivers' },
          { label: 'Delayed', value: '23', icon: AlertTriangle, alert: true },
          { label: 'At Risk', value: '14', icon: AlertTriangle, alert: true },
          { label: 'Failed Deliveries', value: '3', icon: AlertTriangle, alert: true },
          { label: 'Deliveries Today', value: '2,840', icon: CheckCircle2 },
        ].map((kpi, idx) => (
          <Card 
            key={idx} 
            className={`${kpi.alert ? 'border-warning-300 bg-warning-50' : ''} ${kpi.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => kpi.link && (window.location.href = kpi.link)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-500 font-medium truncate pr-2">{kpi.label}</span>
                <kpi.icon className={`h-3 w-3 flex-shrink-0 ${kpi.alert ? 'text-warning-600' : 'text-navy-400'}`} />
              </div>
              <div className={`text-lg font-bold mt-1 ${kpi.alert ? 'text-warning-700' : 'text-navy-900'}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Control Tower View */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Map Area */}
        <Card className="flex-1 overflow-hidden flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Badge variant="default" className="bg-white/90 backdrop-blur shadow-sm">All Regions</Badge>
            <Badge variant="default" className="bg-white/90 backdrop-blur shadow-sm">Live Traffic On</Badge>
          </div>
          <div className="flex-1 bg-navy-100 flex items-center justify-center">
            {/* Placeholder for actual map */}
            <Map className="h-16 w-16 text-navy-300" />
            <span className="text-navy-400 font-medium ml-2">Interactive Map Area</span>
          </div>
        </Card>

        {/* Operations Panel */}
        <Card className="w-80 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-navy-200 bg-white sticky top-0 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">Event Feed</h3>
            <Button variant="ghost" size="sm" onClick={handleTriggerAlert} title="Simulate incoming alert">
              <BellRing className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {events.length === 0 && (
              <p className="text-center text-navy-500 text-sm mt-4">No active events.</p>
            )}
            {events.map(event => (
              <div 
                key={event.id} 
                className={`border-l-2 pl-4 py-1 flex justify-between items-start group
                  ${event.type === 'info' ? 'border-info-500' : 
                    event.type === 'warning' ? 'border-warning-500' : 
                    event.type === 'danger' ? 'border-danger-500' : 'border-success-500'}`}
              >
                <div>
                  <p className="text-sm text-navy-900">{event.text}</p>
                  <p className="text-xs text-navy-400 mt-1">{event.time}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto" 
                  onClick={() => handleAcknowledge(event.id)}
                  title="Acknowledge"
                >
                  <Check className="h-4 w-4 text-navy-400 hover:text-success-600" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
