import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Filter, Download, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ShipmentList() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Shipment Management</h1>
          <p className="text-navy-500 mt-1">Manage and track all enterprise shipments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Link to="/shipments/create">
            <Button><Plus className="h-4 w-4 mr-2" /> Create Shipment</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-navy-200 flex items-center justify-between gap-4 flex-wrap bg-navy-50/50 rounded-t-lg">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <Input 
              placeholder="Search by Tracking ID, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
            <select className="h-10 rounded-md border border-navy-300 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Delayed</option>
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><input type="checkbox" className="rounded border-navy-300" /></TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i}>
                  <TableCell><input type="checkbox" className="rounded border-navy-300" /></TableCell>
                  <TableCell>
                    <Link to={`/shipments/STP-2026-1048${i}`} className="font-medium text-primary-600 hover:underline">
                      STP-2026-1048{i}
                    </Link>
                  </TableCell>
                  <TableCell>Acme Retail</TableCell>
                  <TableCell>Mumbai DC</TableCell>
                  <TableCell>Pune Business Park</TableCell>
                  <TableCell><Badge variant={i % 3 === 0 ? 'warning' : i % 2 === 0 ? 'success' : 'info'}>{i % 3 === 0 ? 'Delayed' : i % 2 === 0 ? 'Delivered' : 'In Transit'}</Badge></TableCell>
                  <TableCell>{i % 2 === 0 ? '-' : 'Today, 2:30 PM'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4 text-navy-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-navy-200 flex items-center justify-between">
            <span className="text-sm text-navy-500">Showing 1 to 8 of 1,248 entries</span>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary-50 text-primary-700 border-primary-200">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
