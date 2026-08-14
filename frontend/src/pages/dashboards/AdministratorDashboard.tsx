import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Package, Truck, AlertTriangle, Route, Users, MapPin, CheckCircle } from 'lucide-react';

export function AdministratorDashboard() {
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
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-navy-500 text-nowrap">Total Shipments</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <MapPin className="h-6 w-6 text-warning-400 mb-2" />
            <div className="text-2xl font-bold">82</div>
            <p className="text-xs text-navy-500 text-nowrap">Ready for Plan</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Truck className="h-6 w-6 text-info-400 mb-2" />
            <div className="text-2xl font-bold">340</div>
            <p className="text-xs text-navy-500 text-nowrap">Assigned</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Route className="h-6 w-6 text-primary-400 mb-2" />
            <div className="text-2xl font-bold">216</div>
            <p className="text-xs text-navy-500 text-nowrap">In Transit</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CheckCircle className="h-6 w-6 text-success-400 mb-2" />
            <div className="text-2xl font-bold">589</div>
            <p className="text-xs text-navy-500 text-nowrap">Delivered</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center border-b-4 border-danger-500">
            <AlertTriangle className="h-6 w-6 text-danger-400 mb-2" />
            <div className="text-2xl font-bold text-danger-600">18</div>
            <p className="text-xs text-navy-500 text-nowrap">Exceptions</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Route className="h-6 w-6 text-indigo-400 mb-2" />
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-navy-500 text-nowrap">Active Routes</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Users className="h-6 w-6 text-success-400 mb-2" />
            <div className="text-2xl font-bold">12</div>
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
                <TableRow>
                  <TableCell className="font-medium">SHP001</TableCell>
                  <TableCell>ABC Ltd</TableCell>
                  <TableCell><Badge variant="info">Assigned</Badge></TableCell>
                  <TableCell>Rahul Sharma</TableCell>
                  <TableCell>RT102</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SHP002</TableCell>
                  <TableCell>XYZ Ltd</TableCell>
                  <TableCell><Badge variant="warning">Ready for Planning</Badge></TableCell>
                  <TableCell className="text-navy-400">Unassigned</TableCell>
                  <TableCell className="text-navy-400">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SHP003</TableCell>
                  <TableCell>PQR Ltd</TableCell>
                  <TableCell><Badge variant="primary">In Transit</Badge></TableCell>
                  <TableCell>Amit Patel</TableCell>
                  <TableCell>RT104</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SHP004</TableCell>
                  <TableCell>LMN Corp</TableCell>
                  <TableCell><Badge variant="success">Delivered</Badge></TableCell>
                  <TableCell>Suresh Kumar</TableCell>
                  <TableCell>RT101</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-navy-100 pb-3">
            <CardTitle className="text-lg">Active Routes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">RT102</TableCell>
                  <TableCell>Rahul Sharma</TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 w-16 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[37.5%]" />
                      </div>
                      <span className="text-xs text-navy-500">3/8</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="primary">In Progress</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RT104</TableCell>
                  <TableCell>Amit Patel</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 w-16 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[75%]" />
                      </div>
                      <span className="text-xs text-navy-500">9/12</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="primary">In Progress</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RT105</TableCell>
                  <TableCell>Vijay Singh</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 w-16 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[0%]" />
                      </div>
                      <span className="text-xs text-navy-500">0/5</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="info">Assigned</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
