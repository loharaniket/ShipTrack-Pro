import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Key, Plus } from 'lucide-react';

export function ApiKeys() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">API Management</h1>
          <p className="text-navy-500 mt-1">Manage programmatic access tokens</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Generate Key</Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { k: 'Production ERP Sync', o: 'System', p: 'Read/Write', l: '5 mins ago', s: 'Active' },
                { k: 'Warehouse Dashboard Display', o: 'Admin', p: 'Read Only', l: '1 hour ago', s: 'Active' },
                { k: 'Test Environment', o: 'Dev Team', p: 'Full Access', l: '3 months ago', s: 'Revoked' },
              ].map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium flex items-center">
                    <Key className="h-4 w-4 mr-2 text-navy-400" />
                    {r.k}
                  </TableCell>
                  <TableCell>{r.o}</TableCell>
                  <TableCell className="text-sm">{r.p}</TableCell>
                  <TableCell className="text-navy-500 text-sm">{r.l}</TableCell>
                  <TableCell>
                    <Badge variant={r.s === 'Active' ? 'success' : 'danger'}>{r.s}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.s === 'Active' && <Button variant="ghost" size="sm" className="text-warning-600">Rotate</Button>}
                    {r.s === 'Active' && <Button variant="ghost" size="sm" className="text-danger-600">Revoke</Button>}
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
