import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, Server, Database, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function SystemHealth() {
  const services = [
    { name: 'API Gateway', status: 'Healthy', type: 'Infrastructure' },
    { name: 'Authentication Service', status: 'Healthy', type: 'Core' },
    { name: 'User Management', status: 'Healthy', type: 'Core' },
    { name: 'Shipment Management', status: 'Healthy', type: 'Core' },
    { name: 'Tracking', status: 'Degraded', type: 'Microservice' },
    { name: 'Live Delivery', status: 'Healthy', type: 'Microservice' },
    { name: 'ETA Prediction', status: 'Healthy', type: 'Intelligence' },
    { name: 'Route Management', status: 'Healthy', type: 'Microservice' },
    { name: 'POD', status: 'Healthy', type: 'Microservice' },
    { name: 'Notification', status: 'Healthy', type: 'Core' },
    { name: 'Analytics', status: 'Healthy', type: 'Microservice' },
    { name: 'Redis', status: 'Healthy', type: 'Database' },
    { name: 'Kafka/RabbitMQ', status: 'Healthy', type: 'Message Broker' },
    { name: 'PostgreSQL', status: 'Healthy', type: 'Database' },
    { name: 'Cloud Storage', status: 'Down', type: 'Infrastructure' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Microservice Health Dashboard</h1>
          <p className="text-navy-500 mt-1">Real-time status of backend services</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-success-50/50 border-success-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success-700">Healthy</p>
              <p className="text-2xl font-bold text-success-900">13</p>
            </div>
            <Activity className="h-8 w-8 text-success-400" />
          </CardContent>
        </Card>
        <Card className="bg-warning-50/50 border-warning-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warning-700">Degraded</p>
              <p className="text-2xl font-bold text-warning-900">1</p>
            </div>
            <Activity className="h-8 w-8 text-warning-400" />
          </CardContent>
        </Card>
        <Card className="bg-danger-50/50 border-danger-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-danger-700">Down</p>
              <p className="text-2xl font-bold text-danger-900">1</p>
            </div>
            <Activity className="h-8 w-8 text-danger-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500">Uptime (30d)</p>
              <p className="text-2xl font-bold text-navy-900">99.98%</p>
            </div>
            <Server className="h-8 w-8 text-navy-200" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{s.name}</CardTitle>
              {s.type === 'Database' ? <Database className="h-4 w-4 text-navy-400" /> :
               s.type === 'Infrastructure' ? <Cloud className="h-4 w-4 text-navy-400" /> :
               <Server className="h-4 w-4 text-navy-400" />}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-navy-500">{s.type}</span>
                <Badge variant={s.status === 'Healthy' ? 'success' : s.status === 'Degraded' ? 'warning' : 'danger'}>
                  {s.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
