import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Package, Truck, AlertTriangle, Route, Users, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useDomain } from '@/context/DomainContext';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '@/utils/dateFormatter';

export function AdministratorDashboard() {
  const navigate = useNavigate();
  const { shipments, exceptions: domainExceptions, routes, drivers, getShipmentView, getVehicleForDriver, getShipmentStatusHistory } = useDomain();
  
  const totalShipments = shipments.length;
  const readyForPlan = shipments.filter(s => s.status === 'Ready for Planning').length;
  const assigned = shipments.filter(s => s.status === 'Assigned').length;
  const inTransit = shipments.filter(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  
  // Real exceptions from Domain Context
  const exceptions = domainExceptions.length;
  
  // Active routes from domain context
  const activeRoutes = routes.filter(r => !['Completed', 'Cancelled', 'Draft'].includes(r.status)).length;

  const mockDrivers = drivers;
  
  const availableDrivers = mockDrivers.filter(d => d.status === 'Active').length;

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

      <Card>
        <CardHeader className="border-b border-navy-100 pb-3">
          <CardTitle className="text-lg">Active Drivers</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Location</TableHead>
                <TableHead>Vehicle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.slice(0, 5).map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-navy-200 flex items-center justify-center text-xs font-medium">
                        {d.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      {d.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'Active' ? 'success' : 'info'}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-500">Not Tracked</TableCell>
                  <TableCell>{getVehicleForDriver(d.id)?.registrationNumber || 'No Vehicle'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Recent Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Shipments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/shipments')}>View All</Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.slice(0, 5).map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-primary-700">{s.trackingNumber}</TableCell>
                  <TableCell>{s.senderName || s.organizationId}</TableCell>
                  <TableCell>{s.recipientName || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'Delivered' ? 'success' : s.status === 'Failed' ? 'danger' : 'info'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-500">
                    {s.updatedAt ? formatRelativeTime(s.updatedAt) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/shipments/${s.trackingNumber}`)}>Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
              {shipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-navy-500">No recent shipments</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
                {shipments.filter(s => s.status === 'Failed').map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-danger-700">{s.trackingNumber}</TableCell>
                    <TableCell>{s.organizationId}</TableCell>
                    <TableCell>{s.driverId || '-'}</TableCell>
                    <TableCell className="font-medium">Delivery Delayed / Address Issue</TableCell>
                    <TableCell className="flex items-center text-navy-500">
                      <Clock className="h-3 w-3 mr-1" /> {s.updatedAt ? formatRelativeTime(s.updatedAt) : 'N/A'}
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
