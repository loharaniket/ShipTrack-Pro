import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, RefreshCw, AlertCircle, Package, 
  Users, Truck, HelpCircle, CheckCircle2, Clock 
} from 'lucide-react';
import { adminService, AdminReport } from '@/services/adminService';
import { ShipmentStatusBadge, TicketStatusBadge } from '@/components/common/ShipmentStatusBadge';

export function Reports() {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getReports();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load operational reports');
    } finally {
      setLoading(false);
    }
  };

  const totalShipments = report?.totalShipments || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Operational Summary & Reports</h1>
          <p className="text-sm text-navy-500 mt-1">
            System throughput, shipment status distributions, and customer service metrics
          </p>
        </div>
        <Button variant="outline" onClick={fetchReports} disabled={loading} className="h-10">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Platform Totals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-navy-500 tracking-wider">Total Shipments</span>
              <p className="text-3xl font-extrabold text-navy-900 mt-1">{loading ? '...' : (report?.totalShipments ?? 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-navy-500 tracking-wider">Registered Customers</span>
              <p className="text-3xl font-extrabold text-navy-900 mt-1">{loading ? '...' : (report?.totalCustomers ?? 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-navy-500 tracking-wider">Courier Drivers</span>
              <p className="text-3xl font-extrabold text-navy-900 mt-1">{loading ? '...' : (report?.totalDrivers ?? 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-navy-500 tracking-wider">Total Complaints</span>
              <p className="text-3xl font-extrabold text-navy-900 mt-1">
                {loading ? '...' : Object.values(report?.ticketBreakdown || {}).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipment Status Breakdown */}
        <Card>
          <CardHeader className="py-4 border-b border-navy-100">
            <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-600" /> Shipment Lifecycle Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {loading ? (
              <p className="text-sm text-navy-400 text-center py-6">Calculating status breakdown...</p>
            ) : !report?.statusBreakdown || Object.keys(report.statusBreakdown).length === 0 ? (
              <p className="text-sm text-navy-400 text-center py-6">No shipment records found.</p>
            ) : (
              Object.entries(report.statusBreakdown).map(([statusKey, count]) => {
                const percentage = totalShipments > 0 ? Math.round((count / totalShipments) * 100) : 0;

                return (
                  <div key={statusKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <ShipmentStatusBadge status={statusKey} />
                      </div>
                      <div className="text-xs font-semibold text-navy-700">
                        {count} <span className="text-navy-400 font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-navy-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Support Ticket Breakdown */}
        <Card>
          <CardHeader className="py-4 border-b border-navy-100">
            <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" /> Customer Support Ticket Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {loading ? (
              <p className="text-sm text-navy-400 text-center py-6">Calculating support ticket metrics...</p>
            ) : !report?.ticketBreakdown || Object.keys(report.ticketBreakdown).length === 0 ? (
              <p className="text-sm text-navy-400 text-center py-6">No support complaints logged.</p>
            ) : (
              Object.entries(report.ticketBreakdown).map(([statusKey, count]) => {
                const totalTickets = Object.values(report.ticketBreakdown).reduce((a, b) => a + b, 0);
                const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;

                return (
                  <div key={statusKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <TicketStatusBadge status={statusKey} />
                      <div className="text-xs font-semibold text-navy-700">
                        {count} <span className="text-navy-400 font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-navy-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
