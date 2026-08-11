import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Truck, AlertTriangle, Plus } from 'lucide-react';

export function FleetManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Fleet Overview</h1>
          <p className="text-navy-500 mt-1">Manage vehicles and maintenance schedules</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Vehicle</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Total Vehicles', value: '450' },
          { label: 'Active', value: '380', color: 'text-success-600' },
          { label: 'Available', value: '42', color: 'text-info-600' },
          { label: 'Offline', value: '15', color: 'text-navy-400' },
          { label: 'Maintenance', value: '13', color: 'text-warning-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-navy-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${stat.color || 'text-navy-900'}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">VH-{1000 + i}</TableCell>
                  <TableCell>MH-12-AB-{4820 + i}</TableCell>
                  <TableCell>Heavy Truck</TableCell>
                  <TableCell>
                    <Badge variant={i === 4 ? 'warning' : 'success'}>
                      {i === 4 ? 'Maintenance' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>{i === 4 ? '-' : 'Rahul Sharma'}</TableCell>
                  <TableCell>{i === 4 ? 'Garage A' : 'Pune Highway'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
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
