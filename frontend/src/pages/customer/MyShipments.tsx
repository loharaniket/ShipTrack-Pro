import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Search, Filter, Plus, ArrowUpRight, Eye, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function MyShipments() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState<CustomerShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await shipmentService.getMyShipments();
      setShipments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = shipments.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      s.trackingNumber.toLowerCase().includes(term) ||
      s.receiverName?.toLowerCase().includes(term) ||
      s.pickupAddress?.toLowerCase().includes(term) ||
      s.deliveryAddress?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' || s.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Shipments</h1>
          <p className="text-sm text-navy-500 mt-1">
            Track and manage all your booked package deliveries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchShipments} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => navigate('/shipments/create')} className="h-10">
            <Plus className="h-4 w-4 mr-2" /> Book Shipment
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
              <Input
                placeholder="Search tracking number, receiver, address..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-navy-500 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
              >
                <option value="ALL">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 m-4 flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading your shipments...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-navy-800">No shipments found</h3>
              <p className="text-sm text-navy-500 mt-1 mb-4">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter parameters.'
                  : "You haven't created any shipments yet."}
              </p>
              <Button onClick={() => navigate('/shipments/create')}>Book New Shipment</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Tracking Number</th>
                    <th className="px-6 py-3.5">Receiver</th>
                    <th className="px-6 py-3.5">Pickup → Delivery</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/shipments/${shipment.id}`}
                          className="font-bold text-primary-600 hover:text-primary-700 font-mono tracking-tight"
                        >
                          {shipment.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{shipment.receiverName}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600 max-w-[240px]">
                        <div className="truncate font-medium">{shipment.pickupAddress}</div>
                        <div className="text-navy-400 truncate">→ {shipment.deliveryAddress}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600 font-medium">
                        {shipment.weight} kg
                      </td>
                      <td className="px-6 py-4">
                        <ShipmentStatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-500">
                        {formatFriendlyDate(shipment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/shipments/${shipment.id}`)}
                          className="h-8 px-2.5 text-xs"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/tracking/${shipment.trackingNumber}`)}
                          className="h-8 px-2 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                          title="Public Tracking"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
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
    </div>
  );
}
