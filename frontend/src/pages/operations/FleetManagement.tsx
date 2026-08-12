import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Truck, AlertTriangle, Plus, Wrench, Play, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function FleetManagement() {
  const [vehicles, setVehicles] = useState([
    { id: 1, vId: 'VH-1001', reg: 'MH-12-AB-4821', type: 'Heavy Truck', stat: 'Active', driver: 'Rahul Sharma', loc: 'Pune Highway' },
    { id: 2, vId: 'VH-1002', reg: 'MH-12-AB-4822', type: 'Van', stat: 'Active', driver: 'Amit Kumar', loc: 'Mumbai Hub' },
    { id: 3, vId: 'VH-1003', reg: 'MH-12-AB-4823', type: 'Heavy Truck', stat: 'Active', driver: 'Suresh Patil', loc: 'Nashik' },
    { id: 4, vId: 'VH-1004', reg: 'MH-12-AB-4824', type: 'Light Truck', stat: 'Maintenance', driver: '-', loc: 'Garage A' },
    { id: 5, vId: 'VH-1005', reg: 'MH-12-AB-4825', type: 'Van', stat: 'Active', driver: 'Vikas Singh', loc: 'Thane' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ vId: '', reg: '', type: 'Van', stat: 'Available', driver: '-', loc: 'Depot' });

  const handleAddVehicle = () => {
    if (!newVehicle.vId || !newVehicle.reg) return;
    setVehicles([...vehicles, { ...newVehicle, id: Date.now() }]);
    setIsModalOpen(false);
    setNewVehicle({ vId: '', reg: '', type: 'Van', stat: 'Available', driver: '-', loc: 'Depot' });
  };

  const handleToggleMaintenance = (id: number) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, stat: v.stat === 'Maintenance' ? 'Active' : 'Maintenance' } : v
    ));
  };

  const handleRetire = (id: number) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const activeCount = vehicles.filter(v => v.stat === 'Active').length;
  const maintenanceCount = vehicles.filter(v => v.stat === 'Maintenance').length;
  const availableCount = vehicles.filter(v => v.stat === 'Available').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Fleet Overview</h1>
          <p className="text-navy-500 mt-1">Manage vehicles and maintenance schedules</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Vehicle</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Vehicles', value: vehicles.length.toString() },
          { label: 'Active', value: activeCount.toString(), color: 'text-success-600' },
          { label: 'Available', value: availableCount.toString(), color: 'text-info-600' },
          { label: 'Maintenance', value: maintenanceCount.toString(), color: 'text-warning-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-navy-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${stat.color || 'text-navy-900'}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-navy-500">No vehicles found.</TableCell>
                </TableRow>
              )}
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.vId}</TableCell>
                  <TableCell>{v.reg}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>
                    <Badge variant={v.stat === 'Maintenance' ? 'warning' : v.stat === 'Available' ? 'info' : 'success'}>
                      {v.stat}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.driver}</TableCell>
                  <TableCell>{v.loc}</TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleMaintenance(v.id)} title="Toggle Maintenance">
                      {v.stat === 'Maintenance' ? <Play className="h-4 w-4 text-success-600" /> : <Wrench className="h-4 w-4 text-warning-600" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleRetire(v.id)} title="Retire Vehicle">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <div className="space-y-4">
          <Input 
            placeholder="Vehicle ID (e.g. VH-1006)" 
            value={newVehicle.vId} 
            onChange={(e) => setNewVehicle({...newVehicle, vId: e.target.value})} 
          />
          <Input 
            placeholder="Registration Plate" 
            value={newVehicle.reg} 
            onChange={(e) => setNewVehicle({...newVehicle, reg: e.target.value})} 
          />
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={newVehicle.type}
            onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
          >
            <option value="Van">Van</option>
            <option value="Light Truck">Light Truck</option>
            <option value="Heavy Truck">Heavy Truck</option>
          </select>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddVehicle}>Add Vehicle</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
