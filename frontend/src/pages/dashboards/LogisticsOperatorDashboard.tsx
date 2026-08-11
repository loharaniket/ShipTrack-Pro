import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Map, Users, AlertTriangle, Truck } from 'lucide-react';

export function LogisticsOperatorDashboard() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: 'Active Shipments', value: '1,248', icon: Truck },
          { label: 'Out for Delivery', value: '432', icon: Truck },
          { label: 'Drivers Active', value: '380', icon: Users },
          { label: 'Vehicles Active', value: '395', icon: Truck },
          { label: 'Delayed', value: '23', icon: AlertTriangle, alert: true },
          { label: 'At Risk', value: '14', icon: AlertTriangle, alert: true },
          { label: 'Failed Deliveries', value: '3', icon: AlertTriangle, alert: true },
          { label: 'Deliveries Today', value: '2,840', icon: CheckCircle },
        ].map((kpi, idx) => (
          <Card key={idx} className={kpi.alert ? 'border-warning-300 bg-warning-50' : ''}>
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
          <div className="p-4 border-b border-navy-200 bg-white sticky top-0">
            <h3 className="font-semibold text-navy-900">Event Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="border-l-2 border-info-500 pl-4 py-1">
              <p className="text-sm text-navy-900">Shipment ST-10492 entered Mumbai distribution zone.</p>
              <p className="text-xs text-navy-400 mt-1">2 mins ago</p>
            </div>
            <div className="border-l-2 border-warning-500 pl-4 py-1">
              <p className="text-sm text-navy-900">ETA updated by +14 mins for Route 8B.</p>
              <p className="text-xs text-navy-400 mt-1">5 mins ago</p>
            </div>
            <div className="border-l-2 border-danger-500 pl-4 py-1">
              <p className="text-sm text-navy-900">Driver Rahul deviated from planned route.</p>
              <p className="text-xs text-navy-400 mt-1">12 mins ago</p>
            </div>
            <div className="border-l-2 border-success-500 pl-4 py-1">
              <p className="text-sm text-navy-900">Delivery completed for ST-10288.</p>
              <p className="text-xs text-navy-400 mt-1">15 mins ago</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Quick polyfill for missing icon
function CheckCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
