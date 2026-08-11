import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, Truck, CheckCircle2, Clock, FileDown, Plus } from 'lucide-react';

export function BusinessClientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Operations Overview</h1>
          <p className="text-navy-500 mt-1">Monitor your enterprise shipments and KPIs</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline"><FileDown className="h-4 w-4 mr-2" /> Download Report</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Create Shipment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-navy-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,482</div>
            <p className="text-xs text-success-500 mt-1">+14.2% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-info-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-navy-400 mt-1">28 delayed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">On-Time Delivery</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.4%</div>
            <p className="text-xs text-navy-400 mt-1">Target: 98.0%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 Days</div>
            <p className="text-xs text-success-500 mt-1">-0.3 days from avg</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-primary-600">STP-2026-10{480 + i}</TableCell>
                  <TableCell>Mumbai DC</TableCell>
                  <TableCell>Pune Hub</TableCell>
                  <TableCell><Badge variant={i % 2 === 0 ? 'info' : 'success'}>{i % 2 === 0 ? 'In Transit' : 'Delivered'}</Badge></TableCell>
                  <TableCell>{i % 2 === 0 ? 'Today, 4:00 PM' : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Track</Button>
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
