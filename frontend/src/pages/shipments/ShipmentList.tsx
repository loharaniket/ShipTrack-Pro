import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Filter, Download, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ShipmentList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [shipments, setShipments] = useState([
    { id: 1, tracking: 'STP-2026-10481', cust: 'Acme Retail', origin: 'Mumbai DC', dest: 'Pune Business Park', stat: 'In Transit', eta: 'Today, 2:30 PM' },
    { id: 2, tracking: 'STP-2026-10482', cust: 'Nova Electronics', origin: 'Delhi Hub', dest: 'Gurgaon', stat: 'Delivered', eta: '-' },
    { id: 3, tracking: 'STP-2026-10483', cust: 'UrbanCart', origin: 'Bangalore', dest: 'Chennai', stat: 'Delayed', eta: 'Tomorrow, 10:00 AM' },
    { id: 4, tracking: 'STP-2026-10484', cust: 'FreshFoods', origin: 'Hyderabad', dest: 'Pune Business Park', stat: 'Delivered', eta: '-' },
    { id: 5, tracking: 'STP-2026-10485', cust: 'Acme Retail', origin: 'Mumbai DC', dest: 'Surat', stat: 'In Transit', eta: 'Today, 6:15 PM' },
  ]);

  const handleCancelShipment = (id: number) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

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
              {shipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-navy-500">No shipments found.</TableCell>
                </TableRow>
              )}
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><input type="checkbox" className="rounded border-navy-300" /></TableCell>
                  <TableCell>
                    <Link to={`/shipments/${s.tracking}`} className="font-medium text-primary-600 hover:underline">
                      {s.tracking}
                    </Link>
                  </TableCell>
                  <TableCell>{s.cust}</TableCell>
                  <TableCell>{s.origin}</TableCell>
                  <TableCell>{s.dest}</TableCell>
                  <TableCell>
                    <Badge variant={s.stat === 'Delayed' ? 'warning' : s.stat === 'Delivered' ? 'success' : 'info'}>
                      {s.stat}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.eta}</TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking/${s.tracking}`)}>Track</Button>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleCancelShipment(s.id)} title="Cancel Shipment">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-navy-200 flex items-center justify-between">
            <span className="text-sm text-navy-500">Showing 1 to {shipments.length} of {shipments.length} entries</span>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary-50 text-primary-700 border-primary-200">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
