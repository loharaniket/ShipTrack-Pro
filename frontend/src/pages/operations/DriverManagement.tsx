import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Download, Trash2, Ban, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useDomain } from '@/context/DomainContext';

export function DriverManagement() {
  const navigate = useNavigate();
  const { drivers, addDriver } = useDomain();

  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Driver Form State
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    regNumber: '',
    type: 'Van',
    capacity: 500
  });

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.phone) return;
    addDriver({
      id: `DRV-${Date.now()}`,
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      status: 'Active',
      vehicle: {
        registrationNumber: newDriver.regNumber,
        type: newDriver.type,
        capacityKg: Number(newDriver.capacity)
      }
    });
    setIsAddModalOpen(false);
    setNewDriver({ name: '', phone: '', email: '', regNumber: '', type: 'Van', capacity: 500 });
  };

  const getVehicleDisplay = (vehicle: any) => {
    if (!vehicle) return <span className="text-navy-400">No Vehicle</span>;
    return `${vehicle.registrationNumber} (${vehicle.type})`;
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
          <Button onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
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
                <TableHead>Driver Vehicle</TableHead>
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
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center mr-3 text-sm font-semibold text-navy-700">
                        {d.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      {d.name}
                    </div>
                  </TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'Inactive' ? 'danger' : d.status === 'On Leave' ? 'warning' : 'success'}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getVehicleDisplay(d.vehicle)}
                  </TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      onClick={() => {
                        setSelectedDriver(d);
                        setIsModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Driver Vehicle Details">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Driver Information</h4>
            <p className="text-sm text-navy-600 font-medium">
              {selectedDriver?.name || 'Unknown Driver'}
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Vehicle Information</h4>
            {selectedDriver?.vehicle ? (
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <p className="text-navy-500">Registration</p>
                  <p className="font-medium text-navy-900">{selectedDriver.vehicle.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-navy-500">Type</p>
                  <p className="font-medium text-navy-900">{selectedDriver.vehicle.type}</p>
                </div>
                <div>
                  <p className="text-navy-500">Capacity</p>
                  <p className="font-medium text-navy-900">{selectedDriver.vehicle.capacityKg} kg</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-500 mt-2">This driver does not have a vehicle configured.</p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Add Driver Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Driver">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
              <Input 
                value={newDriver.name}
                onChange={e => setNewDriver({...newDriver, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Phone</label>
              <Input 
                value={newDriver.phone}
                onChange={e => setNewDriver({...newDriver, phone: e.target.value})}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
              <Input 
                value={newDriver.email}
                onChange={e => setNewDriver({...newDriver, email: e.target.value})}
                placeholder="john@example.com"
                type="email"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1 mb-3">Vehicle Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Registration Number</label>
                <Input 
                  value={newDriver.regNumber}
                  onChange={e => setNewDriver({...newDriver, regNumber: e.target.value})}
                  placeholder="MH-12-AB-1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Vehicle Type</label>
                <select 
                  className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={newDriver.type}
                  onChange={e => setNewDriver({...newDriver, type: e.target.value})}
                >
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Heavy Truck">Heavy Truck</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Capacity (kg)</label>
                <Input 
                  type="number"
                  value={newDriver.capacity}
                  onChange={e => setNewDriver({...newDriver, capacity: Number(e.target.value)})}
                  placeholder="500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDriver} disabled={!newDriver.name || !newDriver.phone}>Add Driver</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
