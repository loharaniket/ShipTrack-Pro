import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, Truck, CheckCircle2, Clock, FileDown, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function BusinessClientDashboard() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([
    { id: 1, tracking: 'STP-2026-10481', origin: 'Mumbai DC', dest: 'Pune Hub', stat: 'In Transit', eta: 'Today, 4:00 PM' },
    { id: 2, tracking: 'STP-2026-10482', origin: 'Mumbai DC', dest: 'Thane', stat: 'Delivered', eta: '-' },
    { id: 3, tracking: 'STP-2026-10483', origin: 'Mumbai DC', dest: 'Nashik', stat: 'In Transit', eta: 'Tomorrow, 10:00 AM' },
    { id: 4, tracking: 'STP-2026-10484', origin: 'Mumbai DC', dest: 'Pune Hub', stat: 'Delivered', eta: '-' },
    { id: 5, tracking: 'STP-2026-10485', origin: 'Mumbai DC', dest: 'Aurangabad', stat: 'In Transit', eta: 'Today, 6:00 PM' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({ dest: '', eta: 'Pending' });

  const handleAddShipment = () => {
    if (!newShipment.dest) return;
    setShipments([...shipments, {
      id: Date.now(),
      tracking: `STP-2026-10${480 + shipments.length + 1}`,
      origin: 'Mumbai DC',
      dest: newShipment.dest,
      stat: 'Processing',
      eta: newShipment.eta
    }]);
    setIsModalOpen(false);
    setNewShipment({ dest: '', eta: 'Pending' });
  };

  const handleCancel = (id: number) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

  const activeShipmentsCount = shipments.filter(s => s.stat !== 'Delivered').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Operations Overview</h1>
          <p className="text-navy-500 mt-1">Monitor your enterprise shipments and KPIs</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline"><FileDown className="h-4 w-4 mr-2" /> Download Report</Button>
          <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Create Shipment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-navy-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{12477 + shipments.length}</div>
            <p className="text-xs text-success-500 mt-1">+14.2% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-info-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{139 + activeShipmentsCount}</div>
            <p className="text-xs text-navy-400 mt-1">Processing included</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">On-Time Delivery</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.4%</div>
            <p className="text-xs text-navy-400 mt-1">Target: 98.0%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 Days</div>
            <p className="text-xs text-success-500 mt-1">-0.3 days from avg</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-4 text-navy-500">No shipments found.</TableCell>
                </TableRow>
              )}
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-primary-600">{s.tracking}</TableCell>
                  <TableCell>{s.origin}</TableCell>
                  <TableCell>{s.dest}</TableCell>
                  <TableCell>
                    <Badge variant={s.stat === 'Processing' ? 'warning' : s.stat === 'In Transit' ? 'info' : 'success'}>
                      {s.stat}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.eta}</TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking/${s.tracking}`)}>Track</Button>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleCancel(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Shipment">
        <div className="space-y-4">
          <Input 
            placeholder="Destination Address" 
            value={newShipment.dest} 
            onChange={(e) => setNewShipment({...newShipment, dest: e.target.value})} 
          />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddShipment}>Create Shipment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
