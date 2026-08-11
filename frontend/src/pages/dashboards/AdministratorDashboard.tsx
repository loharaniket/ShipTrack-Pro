import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Server, Activity, Users, Building, ShieldCheck, Cpu } from 'lucide-react';

export function AdministratorDashboard() {
  const services = [
    { name: 'API Gateway', status: 'Healthy', latency: '24ms' },
    { name: 'Auth Service', status: 'Healthy', latency: '45ms' },
    { name: 'Shipment Service', status: 'Healthy', latency: '112ms' },
    { name: 'Tracking Service', status: 'Healthy', latency: '38ms' },
    { name: 'Live Delivery', status: 'Degraded', latency: '850ms' },
    { name: 'ETA Service', status: 'Healthy', latency: '210ms' },
    { name: 'Route Service', status: 'Healthy', latency: '340ms' },
    { name: 'POD Service', status: 'Healthy', latency: '65ms' },
    { name: 'PostgreSQL', status: 'Healthy', latency: '12ms' },
    { name: 'Redis', status: 'Healthy', latency: '2ms' },
    { name: 'Kafka/RabbitMQ', status: 'Healthy', latency: '8ms' },
    { name: 'Cloud Storage', status: 'Healthy', latency: '42ms' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Administrator Dashboard</h1>
        <p className="text-navy-500 mt-1">System-wide visibility and health monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Building className="h-6 w-6 text-navy-400 mb-2" />
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-navy-500">Organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Users className="h-6 w-6 text-navy-400 mb-2" />
            <div className="text-2xl font-bold">2,482</div>
            <p className="text-xs text-navy-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Activity className="h-6 w-6 text-navy-400 mb-2" />
            <div className="text-2xl font-bold">14.2k</div>
            <p className="text-xs text-navy-500">Active Shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Cpu className="h-6 w-6 text-navy-400 mb-2" />
            <div className="text-2xl font-bold">482</div>
            <p className="text-xs text-navy-500">Active Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Server className="h-6 w-6 text-navy-400 mb-2" />
            <div className="text-2xl font-bold">8.4M</div>
            <p className="text-xs text-navy-500">API Requests/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <ShieldCheck className="h-6 w-6 text-success-500 mb-2" />
            <div className="text-2xl font-bold text-success-600">99.9%</div>
            <p className="text-xs text-navy-500">System Uptime</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map(s => (
              <div key={s.name} className="border border-navy-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-navy-900">{s.name}</p>
                  <p className="text-xs text-navy-500 mt-1">{s.latency}</p>
                </div>
                <Badge variant={s.status === 'Healthy' ? 'success' : s.status === 'Degraded' ? 'warning' : 'danger'}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
