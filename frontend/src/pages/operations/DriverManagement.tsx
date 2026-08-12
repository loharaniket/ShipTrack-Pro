import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Download, Trash2, Ban } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function DriverManagement() {
  const [drivers, setDrivers] = useState([
    { id: 1, dId: 'DRV-1001', name: 'Rahul Sharma', initial: 'RS', phone: '+91 98765 43211', stat: 'Delivering', veh: 'MH-12-AB-4821', today: 7, perf: 87 },
    { id: 2, dId: 'DRV-1002', name: 'Priya Nair', initial: 'PN', phone: '+91 98765 43212', stat: 'Delivering', veh: 'MH-12-AB-4822', today: 9, perf: 89 },
    { id: 3, dId: 'DRV-1003', name: 'Arjun Mehta', initial: 'AM', phone: '+91 98765 43213', stat: 'On Break', veh: 'MH-12-AB-4823', today: 11, perf: 91 },
    { id: 4, dId: 'DRV-1004', name: 'Neha Kapoor', initial: 'NK', phone: '+91 98765 43214', stat: 'Delivering', veh: 'MH-12-AB-4824', today: 13, perf: 93 },
    { id: 5, dId: 'DRV-1005', name: 'Sanjay Mishra', initial: 'SM', phone: '+91 98765 43215', stat: 'Suspended', veh: 'MH-12-AB-4825', today: 15, perf: 95 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehPlate: '', vehType: '' });

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.vehPlate || !newDriver.vehType) return;
    const initial = newDriver.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'D';
    setDrivers([...drivers, {
      id: Date.now(),
      dId: `DRV-${1000 + drivers.length + 1}`,
      name: newDriver.name,
      initial,
      phone: newDriver.phone,
      stat: 'Available',
      veh: `${newDriver.vehPlate} (${newDriver.vehType})`,
      today: 0,
      perf: 100
    }]);
    setIsModalOpen(false);
    setNewDriver({ name: '', phone: '', vehPlate: '', vehType: '' });
  };

  const handleToggleSuspend = (id: number) => {
    setDrivers(drivers.map(d => 
      d.id === id ? { ...d, stat: d.stat === 'Suspended' ? 'Available' : 'Suspended' } : d
    ));
  };

  const handleDelete = (id: number) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Driver Management</h1>
          <p className="text-navy-500 mt-1">Manage personnel, performance, and assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
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
                <TableHead>Deliveries</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-navy-500">No drivers found.</TableCell>
                </TableRow>
              )}
              {drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.dId}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center mr-3 text-sm font-semibold text-navy-700">
                        {d.initial}
                      </div>
                      {d.name}
                    </div>
                  </TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>
                    <Badge variant={d.stat === 'Suspended' ? 'danger' : d.stat === 'On Break' ? 'warning' : 'success'}>
                      {d.stat}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.veh}</TableCell>
                  <TableCell>{d.today} Today</TableCell>
                  <TableCell>
                    <div className="w-20 h-2 bg-navy-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500" style={{ width: `${d.perf}%` }} />
                    </div>
                    <span className="text-xs text-navy-500 mt-1 block">{d.perf}% On-time</span>
                  </TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleSuspend(d.id)} title="Suspend/Activate">
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleDelete(d.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Fleet Unit (Driver & Vehicle)">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Driver Details</h4>
            <Input 
              placeholder="Driver Full Name" 
              value={newDriver.name} 
              onChange={(e) => setNewDriver({...newDriver, name: e.target.value})} 
            />
            <Input 
              placeholder="Phone Number" 
              value={newDriver.phone} 
              onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})} 
            />
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Vehicle Registration</h4>
            <Input 
              placeholder="License Plate (e.g. MH-12-AB-1234)" 
              value={newDriver.vehPlate} 
              onChange={(e) => setNewDriver({...newDriver, vehPlate: e.target.value})} 
            />
            <select 
              className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={newDriver.vehType}
              onChange={(e) => setNewDriver({...newDriver, vehType: e.target.value})}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="Bike">Motorcycle / Bike</option>
              <option value="Van">Cargo Van</option>
              <option value="Truck">Heavy Truck</option>
              <option value="Refrigerated">Refrigerated Truck</option>
            </select>
            <p className="text-xs text-navy-500">Creating this profile automatically links the driver and vehicle permanently.</p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDriver} disabled={!newDriver.name || !newDriver.vehPlate || !newDriver.vehType}>Register Unit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
