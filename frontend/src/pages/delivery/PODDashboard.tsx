import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileCheck, AlertTriangle, Eye, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PODDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Proof of Delivery</h1>
          <p className="text-navy-500 mt-1">Verify and manage delivery confirmations</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Pending Verification</p>
            <p className="text-2xl font-bold mt-1 text-warning-600">42</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Verified Today</p>
            <p className="text-2xl font-bold mt-1 text-success-600">284</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Rejected / Missing</p>
            <p className="text-2xl font-bold mt-1 text-danger-600">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Verification Rate</p>
            <p className="text-2xl font-bold mt-1 text-navy-900">98.9%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent POD Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 'STP-10482', rec: 'Ramesh Singh', t: '10 mins ago', d: 'Rahul Sharma', stat: 'Pending' },
                  { id: 'STP-10483', rec: 'Priya Patel', t: '25 mins ago', d: 'Arjun Mehta', stat: 'Verified' },
                  { id: 'STP-10484', rec: 'Unknown', t: '1 hour ago', d: 'Neha Kapoor', stat: 'Rejected' },
                  { id: 'STP-10485', rec: 'Vikram Gupta', t: '2 hours ago', d: 'Sanjay Mishra', stat: 'Verified' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-primary-600">{row.id}</TableCell>
                    <TableCell>{row.rec}</TableCell>
                    <TableCell className="text-navy-500">{row.t}</TableCell>
                    <TableCell>{row.d}</TableCell>
                    <TableCell>
                      <Badge variant={row.stat === 'Verified' ? 'success' : row.stat === 'Rejected' ? 'danger' : 'warning'}>
                        {row.stat}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/pod/${row.id}`}>
                        <Button variant="ghost" size="sm">Review</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Verification Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-navy-50 p-3 rounded text-sm text-navy-700">
              <span className="font-semibold text-navy-900">STP-10482</span> • Delivered at 2:30 PM
            </div>
            <div>
              <p className="text-sm font-medium text-navy-500 mb-1">Signature</p>
              <div className="border border-navy-200 bg-white rounded p-4 h-24 flex items-center justify-center">
                <span className="font-[cursive] text-2xl text-navy-900">Ramesh Singh</span>
              </div>
            </div>
            <div>
               <p className="text-sm font-medium text-navy-500 mb-1">Delivery Photo</p>
               <div className="bg-navy-200 h-32 rounded flex items-center justify-center">
                 <FileCheck className="h-8 w-8 text-navy-400" />
               </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-success-600 hover:bg-success-700 border-0"><Check className="h-4 w-4 mr-1"/> Verify</Button>
              <Button className="flex-1 bg-danger-600 hover:bg-danger-700 border-0"><X className="h-4 w-4 mr-1"/> Reject</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
