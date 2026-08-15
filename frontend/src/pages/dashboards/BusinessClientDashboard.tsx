import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, Truck, CheckCircle2, Clock, FileDown, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';
import { organizationApi, OrganizationResponse } from '@/services/api/organizationApi';
import { useEffect } from 'react';

export function BusinessClientDashboard() {
  const { user } = useAuth();
  const { shipments, addShipment, updateShipmentStatus, getShipmentView } = useDomain();
  const navigate = useNavigate();
  
  // Real security filtering
  const [currentOrg, setCurrentOrg] = useState<OrganizationResponse | null>(null);
  
  useEffect(() => {
    organizationApi.getCurrent()
      .then(org => setCurrentOrg(org))
      .catch(err => console.error("Could not fetch current organization", err));
  }, []);

  const customerName = currentOrg ? currentOrg.name : 'Acme Retail';
  const customerId = currentOrg ? currentOrg.id : 'ORG-1';
  
  const myShipments = shipments.filter(s => s.organizationId === customerId || s.organizationId === customerName);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({ dest: '' });
  const [shipmentToCancel, setShipmentToCancel] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAddShipment = () => {
    if (!newShipment.dest) return;
    const newId = `STP-2026-10${480 + shipments.length + 1}`;
    addShipment({
      trackingNumber: newId,
      organizationId: customerId,
      serviceType: 'Express',
      originAddressId: 'ADDR-1',
      destinationAddressId: 'ADDR-2',
      priority: 'Standard',
      packages: [{
        description: 'Standard Package',
        quantity: 1,
        weight: 5,
        packageType: 'BOX',
        fragile: false
      }]
    });
    setIsModalOpen(false);
    setNewShipment({ dest: '' });
  };

  const confirmCancel = () => {
    if (shipmentToCancel !== null) {
      updateShipmentStatus({
        shipmentId: shipmentToCancel, 
        newStatus: 'Cancelled', 
        actor: { type: 'USER', userId: user!.id }, 
        note: 'Cancelled by business client'
      });
      setShipmentToCancel(null);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      // Mock successful download
    }, 1500);
  };

  const totalShipments = myShipments.length;
  const activeShipmentsCount = myShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
  const deliveredCount = myShipments.filter(s => s.status === 'Delivered').length;

  const canCancel = (status: string) => {
    return ['Draft', 'Ready for Planning', 'Planned'].includes(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">{customerName} Dashboard</h1>
          <p className="text-navy-500 mt-1">Monitor your enterprise shipments and KPIs</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading} className="flex-1 sm:flex-none">
            <FileDown className={`h-4 w-4 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} /> 
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-navy-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-info-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShipmentsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.4%</div>
            <p className="text-xs text-navy-400 mt-1">Target: 98.0%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0 overflow-x-auto">
          <Table className="min-w-[600px]">
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
              {myShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-navy-500">
                    No shipments found. Create a new one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                myShipments.map((s) => {
                  const view = getShipmentView(s.id);
                  return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-primary-600">{s.trackingNumber}</TableCell>
                    <TableCell>{view?.originAddressLabel}</TableCell>
                    <TableCell>{view?.destinationAddressLabel}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'Draft' || s.status === 'Ready for Planning' ? 'warning' : s.status === 'Delivered' ? 'success' : s.status === 'Cancelled' ? 'danger' : 'info'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{view?.eta || 'Pending'}</TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking/${s.trackingNumber}`)}>Track</Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 disabled:opacity-30 disabled:hover:bg-transparent" 
                        onClick={() => setShipmentToCancel(s.id)}
                        disabled={!canCancel(s.status)}
                        title={!canCancel(s.status) ? `Cannot cancel shipment in ${s.status} state` : "Cancel Shipment"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
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
            <Button onClick={handleAddShipment} disabled={!newShipment.dest.trim()}>Create Shipment</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={shipmentToCancel !== null} onClose={() => setShipmentToCancel(null)} title="Cancel Shipment">
        <div className="space-y-4">
          <p className="text-navy-600">Are you sure you want to cancel this shipment? This action cannot be undone.</p>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShipmentToCancel(null)}>Keep Shipment</Button>
            <Button className="bg-danger-600 hover:bg-danger-700 text-white" onClick={confirmCancel}>Yes, Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
