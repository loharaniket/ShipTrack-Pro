import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Download } from 'lucide-react';

export function DriverManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Driver Management</h1>
          <p className="text-navy-500 mt-1">Manage personnel, performance, and assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Deliveries Today</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">DRV-{1000 + i}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center mr-3 text-sm font-semibold text-navy-700">
                        {['RS', 'PN', 'AM', 'NK', 'SM'][i-1]}
                      </div>
                      {['Rahul Sharma', 'Priya Nair', 'Arjun Mehta', 'Neha Kapoor', 'Sanjay Mishra'][i-1]}
                    </div>
                  </TableCell>
                  <TableCell>+91 98765 {43210 + i}</TableCell>
                  <TableCell>
                    <Badge variant={i % 3 === 0 ? 'warning' : 'success'}>
                      {i % 3 === 0 ? 'On Break' : 'Delivering'}
                    </Badge>
                  </TableCell>
                  <TableCell>MH-12-AB-{4820 + i}</TableCell>
                  <TableCell>{5 + i * 2}</TableCell>
                  <TableCell>
                    <div className="w-20 h-2 bg-navy-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500" style={{ width: `${85 + i * 2}%` }} />
                    </div>
                    <span className="text-xs text-navy-500 mt-1 block">{85 + i * 2}% On-time</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Profile</Button>
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
