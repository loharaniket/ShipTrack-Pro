import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bell, Truck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function NotificationCenter() {
  const notifications = [
    { id: 1, title: 'Delivery Completed', msg: 'Shipment STP-10482 delivered successfully.', time: '10 mins ago', type: 'success', icon: CheckCircle2 },
    { id: 2, title: 'ETA Delayed', msg: 'STP-10483 delayed by 45 mins due to traffic.', time: '1 hour ago', type: 'warning', icon: AlertTriangle },
    { id: 3, title: 'Route Updated', msg: 'New optimized route assigned to Driver Rahul.', time: '2 hours ago', type: 'info', icon: Truck },
    { id: 4, title: 'System Alert', msg: 'Scheduled maintenance this weekend.', time: '1 day ago', type: 'default', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Notification Center</h1>
          <p className="text-navy-500 mt-1">Manage your alerts and system messages</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Mark all as read</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-navy-200 flex gap-4">
          <div className="flex-1">
             <Input placeholder="Search notifications..." className="bg-white" />
          </div>
          <select className="border border-navy-300 rounded px-3 text-sm text-navy-700 bg-white">
            <option>All Categories</option>
            <option>Shipments</option>
            <option>System</option>
            <option>Security</option>
          </select>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-navy-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-navy-50 flex items-start space-x-4 transition-colors">
                <div className={`mt-1 p-2 rounded-full ${
                  n.type === 'success' ? 'bg-success-100 text-success-600' :
                  n.type === 'warning' ? 'bg-warning-100 text-warning-600' :
                  n.type === 'info' ? 'bg-info-100 text-info-600' :
                  'bg-navy-100 text-navy-600'
                }`}>
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-navy-900">{n.title}</h4>
                    <span className="text-xs text-navy-400">{n.time}</span>
                  </div>
                  <p className="text-sm text-navy-600 mt-1">{n.msg}</p>
                </div>
                {n.id <= 2 && <div className="h-2 w-2 rounded-full bg-primary-500 mt-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
