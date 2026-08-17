import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock, Plus, Search, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipments, setShipments] = useState<CustomerShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getMyShipments();
      setShipments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumberInput.trim()) {
      navigate(`/tracking/${encodeURIComponent(trackingNumberInput.trim())}`);
    }
  };

  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PICKED_UP' || s.status === 'ASSIGNED').length;
  const outForDeliveryCount = shipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome back, {user?.name}</h1>
          <p className="text-sm text-navy-500 mt-1">Manage and track your package deliveries in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/customer/tickets')} variant="outline" className="h-10">
            <HelpCircle className="h-4 w-4 mr-2" /> Support
          </Button>
          <Button onClick={() => navigate('/shipments/create')} className="h-10">
            <Plus className="h-4 w-4 mr-2" /> Book Shipment
          </Button>
        </div>
      </div>

      {/* Quick Track Bar */}
      <Card className="bg-gradient-to-r from-primary-900 to-navy-900 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold mb-2">Track Any Shipment</h2>
            <p className="text-sm text-primary-200 mb-4">Enter your STP tracking number for instant live status</p>
            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
                <Input
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. STP10001"
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-navy-300 focus:bg-white focus:text-navy-900 h-10"
                />
              </div>
              <Button type="submit" variant="primary" className="bg-primary-500 hover:bg-primary-600 h-10 px-6 font-semibold">
                Track
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-navy-500 tracking-wider">Total Booked</p>
              <p className="text-2xl font-bold text-navy-900 mt-1">{loading ? '...' : totalShipments}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-600 tracking-wider">In Transit</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{loading ? '...' : inTransitCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-purple-600 tracking-wider">Out for Delivery</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{loading ? '...' : outForDeliveryCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Delivered</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{loading ? '...' : deliveredCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-navy-100">
          <CardTitle className="text-lg font-bold text-navy-900">Recent Shipments</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')} className="text-primary-600">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 m-4 flex items-center gap-2 bg-rose-50 text-rose-800 rounded-lg text-sm border border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-navy-400">Loading shipments...</div>
          ) : shipments.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-navy-800">No shipments found</h3>
              <p className="text-sm text-navy-500 mb-4">You haven't booked any shipments yet.</p>
              <Button onClick={() => navigate('/shipments/create')}>Book Your First Shipment</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3">Tracking Number</th>
                    <th className="px-6 py-3">Receiver</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {shipments.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary-600">
                        <Link to={`/shipments/${s.id}`} className="hover:underline">
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{s.receiverName}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600">
                        <div className="truncate max-w-[200px]">{s.pickupAddress}</div>
                        <div className="text-navy-400">→ {s.deliveryAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <ShipmentStatusBadge status={s.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-500">
                        {formatFriendlyDate(s.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/shipments/${s.id}`)}
                          className="h-8 px-3 text-xs"
                        >
                          Details
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
