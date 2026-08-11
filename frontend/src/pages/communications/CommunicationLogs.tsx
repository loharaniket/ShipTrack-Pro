import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export function CommunicationLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Communication Logs</h1>
          <p className="text-navy-500 mt-1">History of all automated messages and alerts</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-navy-200 flex gap-4 bg-navy-50/50 rounded-t-lg">
          <Input placeholder="Search recipient, subject..." className="max-w-md bg-white" />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Shipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { r: 'customer@acme.com', ch: 'Email', ev: 'shipment.delivered', sh: 'STP-10482', stat: 'Delivered', t: '10 mins ago' },
                { r: '+91 98765 43210', ch: 'SMS', ev: 'eta.delayed', sh: 'STP-10483', stat: 'Delivered', t: '1 hour ago' },
                { r: 'driver.rahul@shiptrack', ch: 'Push', ev: 'route.updated', sh: 'STP-10483', stat: 'Read', t: '2 hours ago' },
                { r: 'admin@shiptrack.pro', ch: 'Email', ev: 'system.alert', sh: '-', stat: 'Failed', t: '1 day ago' },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-navy-900">{row.r}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="font-mono text-xs uppercase">{row.ch}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-navy-600">{row.ev}</TableCell>
                  <TableCell className="text-primary-600 font-medium">{row.sh}</TableCell>
                  <TableCell>
                    <Badge variant={row.stat === 'Failed' ? 'danger' : 'success'}>{row.stat}</Badge>
                  </TableCell>
                  <TableCell className="text-navy-500 text-sm">{row.t}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
