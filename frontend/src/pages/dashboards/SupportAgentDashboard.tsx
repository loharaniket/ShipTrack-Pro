import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LifeBuoy, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export function SupportAgentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Support Dashboard</h1>
          <p className="text-navy-500 mt-1">Manage customer escalations and shipment issues</p>
        </div>
        <div className="flex max-w-sm w-full">
          <Input placeholder="Global search tracking ID..." className="bg-white" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">42</div>
              <LifeBuoy className="h-8 w-8 text-info-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Shipment Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-warning-600">18</div>
              <AlertTriangle className="h-8 w-8 text-warning-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Customer Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-danger-600">5</div>
              <MessageSquare className="h-8 w-8 text-danger-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">2.4h</div>
              <Clock className="h-8 w-8 text-navy-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Exceptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Shipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { s: 'High', type: 'Delivery Delayed', t: '15m ago', stat: 'Open', id: 'STP-9382' },
                { s: 'Critical', type: 'Missing POD', t: '1h ago', stat: 'Investigating', id: 'STP-1123' },
                { s: 'Medium', type: 'Address Issue', t: '2h ago', stat: 'Pending Cust', id: 'STP-5541' },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell><Badge variant={row.s === 'Critical' ? 'danger' : row.s === 'High' ? 'warning' : 'info'}>{row.s}</Badge></TableCell>
                  <TableCell className="font-medium text-primary-600">{row.id}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="text-navy-500">Customer reported package not received.</TableCell>
                  <TableCell>{row.t}</TableCell>
                  <TableCell>{row.stat}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Resolve</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
