import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';

export function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Activity & Audit Logging</h1>
          <p className="text-navy-500 mt-1">Platform-wide security and compliance logs</p>
        </div>
      </div>
      
      <Card>
        <div className="p-4 border-b border-navy-200 flex gap-4 bg-navy-50/50">
          <Input placeholder="Search logs..." className="max-w-md bg-white" />
          <select className="border border-navy-300 rounded px-3 text-sm text-navy-700 bg-white">
             <option>All Actions</option>
             <option>Login</option>
             <option>Shipment Created</option>
             <option>Permission Changed</option>
          </select>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { u: 'Aniket Lohar', a: 'User logged in', r: 'Auth System', ip: '192.168.1.105', t: '2026-08-11 10:42:01' },
                { u: 'Logistics Ops', a: 'Driver assigned', r: 'Shipment STP-10482', ip: '10.0.4.52', t: '2026-08-11 10:35:14' },
                { u: 'Business User', a: 'Shipment created', r: 'Shipment STP-10482', ip: '203.0.113.42', t: '2026-08-11 10:30:00' },
                { u: 'Rahul Sharma', a: 'POD submitted', r: 'Shipment STP-10471', ip: '117.218.42.11', t: '2026-08-11 09:15:22' },
              ].map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-navy-900">{r.u}</TableCell>
                  <TableCell className="text-sm font-medium">{r.a}</TableCell>
                  <TableCell className="text-sm text-navy-600">{r.r}</TableCell>
                  <TableCell className="text-xs font-mono text-navy-400">{r.ip}</TableCell>
                  <TableCell className="text-navy-500 text-sm">{r.t}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
