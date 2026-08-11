import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function Roles() {
  const roles = ['Administrator', 'LogisticsOperator', 'SupportAgent', 'BusinessClient', 'Customer', 'Driver'];
  const permissions = ['View Shipments', 'Create Shipments', 'Edit Shipments', 'Delete Shipments', 'Manage Users', 'Manage Roles', 'View Analytics'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">RBAC Management</h1>
          <p className="text-navy-500 mt-1">Role and Permission Matrix</p>
        </div>
        <Button variant="outline">Save Changes</Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 bg-navy-50 sticky left-0 z-10">Permission \ Role</TableHead>
                {roles.map(r => (
                  <TableHead key={r} className="text-center bg-navy-50">{r}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p, i) => (
                <TableRow key={p}>
                  <TableCell className="font-medium bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">{p}</TableCell>
                  {roles.map((r, j) => {
                     // Fake logic to populate matrix
                     const hasPerm = (r === 'Administrator') || 
                                     (r === 'LogisticsOperator' && !p.includes('Manage')) ||
                                     (r === 'SupportAgent' && !p.includes('Manage') && !p.includes('Delete')) ||
                                     (r === 'BusinessClient' && (p === 'View Shipments' || p === 'Create Shipments' || p === 'View Analytics')) ||
                                     (r === 'Customer' && p === 'View Shipments') ||
                                     (r === 'Driver' && p === 'View Shipments');
                     return (
                       <TableCell key={j} className="text-center border-l border-navy-100">
                         <input type="checkbox" className="rounded text-primary-600 h-4 w-4" checked={hasPerm} readOnly />
                       </TableCell>
                     );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
