import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Truck, CheckCircle2, AlertCircle, RefreshCw, 
  UserCheck, MapPin, Package, ArrowLeft, Search 
} from 'lucide-react';
import { adminService, DriverUser } from '@/services/adminService';
import { CustomerShipmentItem } from '@/services/shipmentService';
import { formatFriendlyDate } from '@/utils/dateFormatter';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';

export function PendingShipments() {
  const navigate = useNavigate();

  const [pendingShipments, setPendingShipments] = useState<CustomerShipmentItem[]>([]);
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Assignment Modal State
  const [selectedShipment, setSelectedShipment] = useState<CustomerShipmentItem | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [shipmentsData, driversData] = await Promise.all([
        adminService.getPendingShipments(),
        adminService.getDrivers()
      ]);
      setPendingShipments(shipmentsData || []);
      setDrivers(driversData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending shipments or drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (shipment: CustomerShipmentItem) => {
    setSelectedShipment(shipment);
    setSelectedDriverId(drivers.length > 0 ? drivers[0].id : '');
    setAssignError('');
  };

  const handleConfirmAssignment = async () => {
    if (!selectedShipment || !selectedDriverId) {
      setAssignError('Please select a driver from the pool.');
      return;
    }

    setIsAssigning(true);
    setAssignError('');

    try {
      await adminService.assignDriver(selectedShipment.id, selectedDriverId);
      
      const assignedDriver = drivers.find(d => d.id === selectedDriverId);
      const driverDisplayName = assignedDriver?.firstName 
        ? `${assignedDriver.firstName} ${assignedDriver.lastName || ''}`.trim() 
        : (assignedDriver?.email || 'driver');

      setSuccessMsg(`Shipment ${selectedShipment.trackingNumber} successfully assigned to ${driverDisplayName}!`);
      
      // Remove from pending queue
      setPendingShipments(prev => prev.filter(s => s.id !== selectedShipment.id));
      setSelectedShipment(null);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign driver. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = pendingShipments.filter(s => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      s.trackingNumber.toLowerCase().includes(term) ||
      s.receiverName?.toLowerCase().includes(term) ||
      s.senderName?.toLowerCase().includes(term) ||
      s.pickupAddress?.toLowerCase().includes(term) ||
      s.deliveryAddress?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Pending Dispatch Allocation</h1>
          <p className="text-sm text-navy-500 mt-1">
            Assign active courier drivers to newly booked customer shipments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadData} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-sm shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tracking #, sender, recipient, address..."
              className="w-full pl-9 pr-4 h-10 rounded-lg border border-navy-200 bg-white text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading pending dispatch queue...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Shipments Pending Allocation</h3>
              <p className="text-sm text-navy-500 mt-1">
                {searchTerm ? 'No results matched your search term.' : 'All incoming shipments have already been assigned to drivers.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Tracking #</th>
                    <th className="px-6 py-3.5">Sender</th>
                    <th className="px-6 py-3.5">Receiver</th>
                    <th className="px-6 py-3.5">Pickup → Destination</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Booked At</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary-600">
                        {s.trackingNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{s.senderName}</div>
                        {s.senderPhone && <div className="text-xs text-navy-500">{s.senderPhone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{s.receiverName}</div>
                        {s.receiverPhone && <div className="text-xs text-navy-500">{s.receiverPhone}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600 max-w-[240px]">
                        <div className="truncate font-medium">{s.pickupAddress}</div>
                        <div className="text-navy-400 truncate">→ {s.deliveryAddress}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-navy-700">
                        {s.weight} kg
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-500">
                        {formatFriendlyDate(s.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenAssignModal(s)}
                          className="h-8 px-3 text-xs"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Assign Driver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      {selectedShipment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedShipment(null)}
          title={`Assign Driver to ${selectedShipment.trackingNumber}`}
        >
          <div className="space-y-4">
            {assignError && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            {/* Shipment Summary */}
            <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-500">Receiver:</span>
                <span className="font-semibold text-navy-900">{selectedShipment.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Pickup:</span>
                <span className="font-medium text-navy-800 max-w-[200px] truncate">{selectedShipment.pickupAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Destination:</span>
                <span className="font-medium text-navy-800 max-w-[200px] truncate">{selectedShipment.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Weight:</span>
                <span className="font-semibold text-navy-900">{selectedShipment.weight} kg</span>
              </div>
            </div>

            {/* Driver Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-1">
                Select Courier Driver
              </label>
              {drivers.length === 0 ? (
                <p className="text-xs text-rose-600 py-2">
                  No active drivers found in system. Please ensure drivers are registered.
                </p>
              ) : (
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName ? `${d.firstName} ${d.lastName || ''}`.trim() : d.email} ({d.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setSelectedShipment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAssignment}
                isLoading={isAssigning}
                disabled={drivers.length === 0}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
