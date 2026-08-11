import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Webhook, Plus } from 'lucide-react';

export function Webhooks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Webhook Management</h1>
          <p className="text-navy-500 mt-1">Configure event-driven HTTP callbacks</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Webhook</Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Failures</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { e: 'https://api.acme.com/v1/shiptrack-events', ev: 'shipment.*, pod.verified', s: 'Healthy', l: '2 mins ago', f: 0 },
                { e: 'https://hooks.slack.com/services/T0000', ev: 'shipment.delayed', s: 'Healthy', l: '5 hours ago', f: 0 },
                { e: 'https://internal.erp.local/ingest', ev: 'shipment.delivered', s: 'Failing', l: '1 day ago', f: 142 },
              ].map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-primary-600 flex items-center">
                    <Webhook className="h-4 w-4 mr-2 text-navy-400" />
                    {r.e}
                  </TableCell>
                  <TableCell className="text-xs font-mono bg-navy-50 p-1 rounded inline-block mt-2">{r.ev}</TableCell>
                  <TableCell>
                    <Badge variant={r.s === 'Healthy' ? 'success' : 'danger'}>{r.s}</Badge>
                  </TableCell>
                  <TableCell className="text-navy-500 text-sm">{r.l}</TableCell>
                  <TableCell className={r.f > 0 ? 'text-danger-600 font-medium' : 'text-navy-500'}>{r.f}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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
