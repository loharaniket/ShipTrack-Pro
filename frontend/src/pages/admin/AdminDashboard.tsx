import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Truck, Clock, CheckCircle2, AlertTriangle, 
  Users, UserCheck, ArrowRight, RefreshCw, AlertCircle, ShieldAlert 
} from 'lucide-react';
import { adminService, DashboardStats } from '@/services/adminService';
import { CustomerShipmentItem } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingShipments, setPendingShipments] = useState<CustomerShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, pendingData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPendingShipments()
      ]);
      setStats(statsData);
      setPendingShipments(pendingData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Administrator Operations Portal</h1>
          <p className="text-sm text-navy-500 mt-1">
            Real-time platform metrics, dispatch queues, and fleet supervision
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadDashboardData} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => navigate('/admin/shipments/pending')} className="h-10">
            <Clock className="h-4 w-4 mr-2" /> Pending Dispatch ({stats?.pendingDispatch ?? '...'})
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Shipments */}
        <Card className="hover:border-navy-300 transition-colors">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-navy-500 tracking-wider">Total</span>
              <Package className="h-4 w-4 text-navy-500" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-navy-900">{loading ? '...' : (stats?.totalShipments ?? 0)}</p>
              <p className="text-xs text-navy-400 mt-0.5">Shipments booked</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Dispatch */}
        <Card className="hover:border-amber-300 transition-colors bg-amber-50/40 border-amber-200">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-700 tracking-wider">Pending</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-amber-800">{loading ? '...' : (stats?.pendingDispatch ?? 0)}</p>
              <p className="text-xs text-amber-700 mt-0.5">Need driver assigned</p>
            </div>
          </CardContent>
        </Card>

        {/* In Transit */}
        <Card className="hover:border-sky-300 transition-colors">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-sky-700 tracking-wider">In Transit</span>
              <Truck className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-sky-800">{loading ? '...' : (stats?.inTransit ?? 0)}</p>
              <p className="text-xs text-navy-400 mt-0.5">On the road</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="hover:border-emerald-300 transition-colors bg-emerald-50/30 border-emerald-200">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Delivered</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-emerald-800">{loading ? '...' : (stats?.delivered ?? 0)}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Completed with POD</p>
            </div>
          </CardContent>
        </Card>

        {/* Open Complaints */}
        <Card className="hover:border-rose-300 transition-colors">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-rose-700 tracking-wider">Complaints</span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-rose-800">{loading ? '...' : (stats?.openComplaints ?? 0)}</p>
              <p className="text-xs text-navy-400 mt-0.5">Open support tickets</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Drivers */}
        <Card className="hover:border-navy-300 transition-colors">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-navy-700 tracking-wider">Fleet</span>
              <UserCheck className="h-4 w-4 text-navy-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-navy-900">{loading ? '...' : (stats?.activeDrivers ?? 0)}</p>
              <p className="text-xs text-navy-400 mt-0.5">Active drivers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/shipments/pending')}
          className="p-5 rounded-xl border border-navy-200 bg-white hover:border-primary-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-600 transition-colors">
                Pending Dispatch Queue
              </h3>
              <p className="text-xs text-navy-500">Assign drivers to newly booked shipments</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-navy-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={() => navigate('/admin/drivers')}
          className="p-5 rounded-xl border border-navy-200 bg-white hover:border-primary-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-600 transition-colors">
                Fleet & Driver Pool
              </h3>
              <p className="text-xs text-navy-500">View active couriers and status</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-navy-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={() => navigate('/admin/reports')}
          className="p-5 rounded-xl border border-navy-200 bg-white hover:border-primary-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-600 transition-colors">
                Operational Reports
              </h3>
              <p className="text-xs text-navy-500">System delivery ratios and breakdown</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-navy-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Pending Dispatch Queue Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-navy-100">
          <div>
            <CardTitle className="text-lg font-bold text-navy-900">Shipments Awaiting Driver Assignment</CardTitle>
            <p className="text-xs text-navy-500 mt-0.5">Shipments in CREATED status requiring dispatch allocation</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/shipments/pending')}>
            Manage All ({pendingShipments.length})
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-navy-400">Loading pending dispatch queue...</div>
          ) : pendingShipments.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-navy-900">Dispatch Queue is Clear!</h3>
              <p className="text-sm text-navy-500">All booked shipments currently have assigned drivers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Tracking Number</th>
                    <th className="px-6 py-3.5">Sender</th>
                    <th className="px-6 py-3.5">Receiver</th>
                    <th className="px-6 py-3.5">Pickup → Destination</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Booked At</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {pendingShipments.slice(0, 6).map((s) => (
                    <tr key={s.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary-600">
                        {s.trackingNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{s.senderName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{s.receiverName}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600 max-w-[220px]">
                        <div className="truncate">{s.pickupAddress}</div>
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
                          onClick={() => navigate('/admin/shipments/pending')}
                          className="h-8 px-3 text-xs"
                        >
                          Assign Driver
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
