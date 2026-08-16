import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Filter, Download, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function ShipmentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shipments: domainShipments, updateShipmentStatus, drivers, getShipmentView } = useDomain();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [shipmentToCancel, setShipmentToCancel] = useState<string | null>(null);

  // Role-based filtering of the central data
  let visibleShipments = [...domainShipments];
  if (user?.role === 'Driver') {
    const driverRecord = drivers.find(d => d.email === user?.email) || drivers.find(d => d.name === user?.name) || drivers[0];
    visibleShipments = visibleShipments.filter(s => s.driverId === driverRecord.id);
  }
  // Note: BusinessClient and Customer shipments are already securely filtered by the backend API.
  // There is no need to manually filter by user.organizationId here.
    
  const confirmCancel = () => {
    if (shipmentToCancel !== null) {
      updateShipmentStatus({
        shipmentId: shipmentToCancel, 
        newStatus: 'Cancelled', 
        actor: { type: 'USER', userId: user!.id }, 
        location: 'Shipment List View'
      });
      setSelectedIds(selectedIds.filter(id => id !== shipmentToCancel));
      setShipmentToCancel(null);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const isDriver = user?.role === 'Driver';
  const canCreate = ['Administrator', 'BusinessClient'].includes(user?.role || '');
  
  const filteredShipments = visibleShipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.organizationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Statuses' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length && filteredShipments.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShipments.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const canCancel = (status: string) => {
    return ['Draft', 'Ready for Planning', 'Planned'].includes(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">{isDriver ? 'My Assigned Shipments' : 'Shipment Management'}</h1>
          <p className="text-navy-500 mt-1">{isDriver ? 'View and track your assigned deliveries' : 'Manage and track all enterprise shipments'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} /> 
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          {canCreate && (
            <Link to="/shipments/create">
              <Button><Plus className="h-4 w-4 mr-2" /> Create Shipment</Button>
            </Link>
          )}
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
            <Button variant="outline" className="hidden sm:flex"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
            <select 
              className="h-10 rounded-md border border-navy-300 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Draft</option>
              <option>Ready for Planning</option>
              <option>Assigned</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Failed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-navy-300 cursor-pointer" 
                    checked={filteredShipments.length > 0 && selectedIds.length === filteredShipments.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
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
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-navy-500">
                    No shipments found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((s) => {
                  const view = getShipmentView(s.id);
                  return (
                  <TableRow key={s.id} className={selectedIds.includes(s.id) ? 'bg-primary-50/50' : ''}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="rounded border-navy-300 cursor-pointer" 
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelect(s.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link to={`/shipments/${s.trackingNumber}`} className="font-medium text-primary-600 hover:underline">
                        {s.trackingNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{s.senderName || 'Unknown Customer'}</TableCell>
                    <TableCell>{view?.originAddressLabel}</TableCell>
                    <TableCell>{view?.destinationAddressLabel}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'Draft' || s.status === 'Ready for Planning' ? 'warning' : s.status === 'Failed' || s.status === 'Cancelled' ? 'danger' : s.status === 'Delivered' ? 'success' : 'info'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFriendlyDate(s.scheduledDelivery)}</TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking/${s.trackingNumber}`)}>Track</Button>
                      {(!isDriver && user?.role !== 'Customer') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 disabled:opacity-30 disabled:hover:bg-transparent" 
                          onClick={() => setShipmentToCancel(s.id)} 
                          title={!canCancel(s.status) ? `Cannot cancel shipment in ${s.status} state` : "Cancel Shipment"}
                          disabled={!canCancel(s.status)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-navy-200 flex items-center justify-between">
            <span className="text-sm text-navy-500">
              Showing {filteredShipments.length > 0 ? 1 : 0} to {filteredShipments.length} of {visibleShipments.length} entries
              {selectedIds.length > 0 && <span className="ml-2 font-medium text-primary-600">({selectedIds.length} selected)</span>}
            </span>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary-50 text-primary-700 border-primary-200">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm transition-opacity ${shipmentToCancel !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full m-4">
          <h3 className="text-lg font-bold text-navy-900 mb-2">Cancel Shipment</h3>
          <p className="text-navy-600 mb-6">Are you sure you want to cancel this shipment? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShipmentToCancel(null)}>Keep Shipment</Button>
            <Button className="bg-danger-600 hover:bg-danger-700 text-white" onClick={confirmCancel}>Yes, Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
