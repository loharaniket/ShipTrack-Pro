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
  const { drivers, vehicles, assignFleetToDriver } = useDomain();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const handleAssignVehicle = () => {
    if (selectedDriverId && selectedVehicleId) {
      assignFleetToDriver(selectedDriverId, selectedVehicleId);
      setIsModalOpen(false);
      setSelectedDriverId(null);
      setSelectedVehicleId('');
    }
  };

  const getVehicleDisplay = (vehicleId: string | null | undefined) => {
    if (!vehicleId) return <span className="text-navy-400">Not Assigned</span>;
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.registration} (${v.type})` : vehicleId;
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
                <TableHead>Assigned Vehicle</TableHead>
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
                    {getVehicleDisplay(d.vehicleId)}
                  </TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      onClick={() => {
                        setSelectedDriverId(d.id);
                        setSelectedVehicleId(d.vehicleId || '');
                        setIsModalOpen(true);
                      }}
                    >
                      Assign Vehicle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Vehicle to Driver">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Driver Details</h4>
            <p className="text-sm text-navy-600 font-medium">
              {drivers.find(d => d.id === selectedDriverId)?.name || 'Unknown Driver'}
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-semibold text-navy-900 border-b border-navy-100 pb-1">Select Vehicle</h4>
            <select 
              className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="" disabled>Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registration} ({v.type}) - Cap: {v.capacityKg}kg</option>
              ))}
            </select>
            <p className="text-xs text-navy-500">Creating this assignment automatically links the driver and vehicle for all route planning.</p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignVehicle} disabled={!selectedVehicleId}>Assign Vehicle</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
