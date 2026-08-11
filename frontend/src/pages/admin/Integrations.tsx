import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Map, Truck, Mail, MessageSquare, Bell, Package, Database, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Integrations() {
  const integrations = [
    { name: 'OpenStreetMap', type: 'Maps', icon: Map, status: 'Connected', desc: 'Primary map tiles provider.' },
    { name: 'Samsara', type: 'GPS', icon: Truck, status: 'Connected', desc: 'Real-time vehicle telematics.' },
    { name: 'SendGrid', type: 'Email', icon: Mail, status: 'Connected', desc: 'Transactional email service.' },
    { name: 'Twilio', type: 'SMS', icon: MessageSquare, status: 'Configured', desc: 'SMS notifications for ETAs.' },
    { name: 'Firebase FCM', type: 'Push', icon: Bell, status: 'Connected', desc: 'Mobile driver push notifications.' },
    { name: 'SAP ERP', type: 'ERP', icon: Database, status: 'Disconnected', desc: 'Enterprise resource planning sync.' },
    { name: 'Shopify', type: 'E-commerce', icon: Package, status: 'Available', desc: 'Import orders from Shopify.' },
    { name: 'AWS S3', type: 'Storage', icon: Cloud, status: 'Connected', desc: 'POD signature and photo storage.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Integration Center</h1>
          <p className="text-navy-500 mt-1">Manage external services and connectors</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((inv, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-navy-50 rounded-lg">
                   <inv.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <CardTitle>{inv.name}</CardTitle>
                  <p className="text-xs text-navy-500">{inv.type}</p>
                </div>
              </div>
              <Badge variant={inv.status === 'Connected' ? 'success' : inv.status === 'Disconnected' ? 'danger' : 'default'}>
                {inv.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-2">
              <p className="text-sm text-navy-600 mb-4">{inv.desc}</p>
              <div className="flex space-x-2 mt-auto">
                {inv.status === 'Available' ? (
                  <Button className="w-full" variant="outline">Connect</Button>
                ) : (
                  <>
                    <Button className="flex-1" variant="outline">Configure</Button>
                    {inv.status !== 'Disconnected' && <Button className="flex-1" variant="ghost">Test</Button>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
