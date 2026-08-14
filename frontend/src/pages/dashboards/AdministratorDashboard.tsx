import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Package, Truck, AlertTriangle, Route, Users, MapPin, CheckCircle, Clock } from 'lucide-react';
import { MOCK_SHIPMENTS } from '@/services/mockData';

export function AdministratorDashboard() {
  const totalShipments = MOCK_SHIPMENTS.length;
  const readyForPlan = MOCK_SHIPMENTS.filter(s => s.status === 'Ready for Planning').length;
  const assigned = MOCK_SHIPMENTS.filter(s => s.status === 'Assigned').length;
  const inTransit = MOCK_SHIPMENTS.filter(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status)).length;
  const delivered = MOCK_SHIPMENTS.filter(s => s.status === 'Delivered').length;
  const exceptions = MOCK_SHIPMENTS.filter(s => s.status === 'Exceptions').length;
  
  // Calculate active routes based on unique routes for shipments not delivered/cancelled
  const activeRoutes = new Set(
    MOCK_SHIPMENTS
      .filter(s => s.route && !['Delivered', 'Cancelled', 'Exceptions'].includes(s.status))
      .map(s => s.route)
  ).size;

  const mockDrivers = [
    { id: 1, name: 'Rahul Sharma', status: 'On Route', location: 'Pune Highway', vehicle: 'MH-12-AB-4821' },
    { id: 2, name: 'Amit Singh', status: 'Available', location: 'Mumbai DC', vehicle: 'MH-14-XY-9922' },
    { id: 3, name: 'Vijay Singh', status: 'Available', location: 'Kolkata Port', vehicle: 'MH-01-AB-1234' },
    { id: 4, name: 'Suresh Kumar', status: 'On Route', location: 'Navi Mumbai', vehicle: 'MH-43-XY-5544' },
  ];
  
  const availableDrivers = mockDrivers.filter(d => d.status === 'Available').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Administrator Dashboard</h1>
        <p className="text-navy-500 mt-1">Operational Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Package className="h-6 w-6 text-navy-400 mb-2" />
            <div className="text-2xl font-bold">{totalShipments}</div>
            <p className="text-xs text-navy-500 text-nowrap">Total Shipments</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <MapPin className="h-6 w-6 text-warning-400 mb-2" />
            <div className="text-2xl font-bold">{readyForPlan}</div>
            <p className="text-xs text-navy-500 text-nowrap">Ready for Plan</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Truck className="h-6 w-6 text-info-400 mb-2" />
            <div className="text-2xl font-bold">{assigned}</div>
            <p className="text-xs text-navy-500 text-nowrap">Assigned</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Route className="h-6 w-6 text-primary-400 mb-2" />
            <div className="text-2xl font-bold">{inTransit}</div>
            <p className="text-xs text-navy-500 text-nowrap">In Transit</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CheckCircle className="h-6 w-6 text-success-400 mb-2" />
            <div className="text-2xl font-bold">{delivered}</div>
            <p className="text-xs text-navy-500 text-nowrap">Delivered</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center border-b-4 border-danger-500">
            <AlertTriangle className="h-6 w-6 text-danger-400 mb-2" />
            <div className="text-2xl font-bold text-danger-600">{exceptions}</div>
            <p className="text-xs text-navy-500 text-nowrap">Exceptions</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Route className="h-6 w-6 text-indigo-400 mb-2" />
            <div className="text-2xl font-bold">{activeRoutes}</div>
            <p className="text-xs text-navy-500 text-nowrap">Active Routes</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Users className="h-6 w-6 text-success-400 mb-2" />
            <div className="text-2xl font-bold">{availableDrivers}</div>
            <p className="text-xs text-navy-500 text-nowrap">Avail. Drivers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-navy-100 pb-3">
            <CardTitle className="text-lg">Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Route</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SHIPMENTS.slice(0, 5).map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.tracking}</TableCell>
                    <TableCell>{s.customer}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'Delivered' ? 'success' : s.status === 'Exceptions' ? 'danger' : s.status === 'Ready for Planning' || s.status === 'Draft' ? 'warning' : 'info'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={!s.driver ? "text-navy-400" : ""}>{s.driver || 'Unassigned'}</TableCell>
                    <TableCell className={!s.route ? "text-navy-400" : ""}>{s.route || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-navy-100 pb-3">
            <CardTitle className="text-lg">Driver Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Vehicle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDrivers.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'Available' ? 'success' : 'primary'}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.location}</TableCell>
                    <TableCell>{d.vehicle}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Exceptions and Alerts row */}
      {exceptions > 0 && (
        <Card className="border-danger-200">
          <CardHeader className="bg-danger-50 border-b border-danger-100 pb-3">
            <CardTitle className="text-lg text-danger-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> 
              Operational Exceptions Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SHIPMENTS.filter(s => s.status === 'Exceptions').map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-danger-700">{s.tracking}</TableCell>
                    <TableCell>{s.customer}</TableCell>
                    <TableCell>{s.driver || '-'}</TableCell>
                    <TableCell className="font-medium">Delivery Delayed / Address Issue</TableCell>
                    <TableCell className="flex items-center text-navy-500">
                      <Clock className="h-3 w-3 mr-1" /> {s.lastUpdated}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
