import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export function Users() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">User Management</h1>
          <p className="text-navy-500 mt-1">Platform-wide user administration</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Invite User</Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { u: 'Aniket Lohar', e: 'admin@shiptrack.pro', r: 'Administrator', o: 'ShipTrack', m: 'Enabled', s: 'Active' },
                { u: 'Support Team', e: 'support@shiptrack.pro', r: 'SupportAgent', o: 'ShipTrack', m: 'Enabled', s: 'Active' },
                { u: 'Logistics Ops', e: 'operator@shiptrack.pro', r: 'LogisticsOperator', o: 'Mumbai Hub', m: 'Disabled', s: 'Active' },
              ].map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.u}</TableCell>
                  <TableCell className="text-navy-500">{r.e}</TableCell>
                  <TableCell><Badge variant="default">{r.r}</Badge></TableCell>
                  <TableCell>{r.o}</TableCell>
                  <TableCell>
                    <Badge variant={r.m === 'Enabled' ? 'success' : 'warning'}>{r.m}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant="success">{r.s}</Badge>
                  </TableCell>
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
