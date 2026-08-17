import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { 
  HelpCircle, MessageSquare, Clock, CheckCircle2, 
  AlertCircle, RefreshCw, ArrowRight, User, Package, Filter, Search 
} from 'lucide-react';
import { supportService, SupportTicket } from '@/services/supportService';
import { TicketStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';
import { useAuth } from '@/context/AuthContext';

export function SupportDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [targetStatus, setTargetStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('IN_PROGRESS');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportService.getAllTickets();
      setTickets(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    const s = ticket.status.toUpperCase();
    if (s === 'OPEN') {
      setTargetStatus('IN_PROGRESS');
    } else if (s === 'IN_PROGRESS') {
      setTargetStatus('RESOLVED');
    } else {
      setTargetStatus('CLOSED');
    }
    setUpdateError('');
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedTicket) return;

    setIsUpdating(true);
    setUpdateError('');

    try {
      await supportService.updateTicketStatus(selectedTicket.id, targetStatus);
      setSuccessMsg(`Ticket #${selectedTicket.id.substring(0, 8)} status updated to ${targetStatus}!`);
      setSelectedTicket(null);
      await loadTickets();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Customer Support Console</h1>
          <p className="text-sm text-navy-500 mt-1">
            Welcome back, {user?.name || 'Agent'}. Resolve customer inquiries and manage issue lifecycles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadTickets} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => navigate('/support/tickets')} className="h-10">
            <MessageSquare className="h-4 w-4 mr-2" /> All Tickets ({totalCount})
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

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-navy-500 tracking-wider">Total</span>
              <MessageSquare className="h-4 w-4 text-navy-500" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-navy-900">{loading ? '...' : totalCount}</p>
              <p className="text-xs text-navy-400 mt-0.5">Tickets logged</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-700 tracking-wider">Open</span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-amber-800">{loading ? '...' : openCount}</p>
              <p className="text-xs text-amber-700 mt-0.5">Awaiting agent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50/20">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-sky-700 tracking-wider">In Progress</span>
              <Clock className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-sky-800">{loading ? '...' : inProgressCount}</p>
              <p className="text-xs text-sky-700 mt-0.5">Under investigation</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Resolved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-emerald-800">{loading ? '...' : resolvedCount}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Resolution provided</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-navy-500 tracking-wider">Closed</span>
              <CheckCircle2 className="h-4 w-4 text-navy-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-navy-700">{loading ? '...' : closedCount}</p>
              <p className="text-xs text-navy-400 mt-0.5">Archived</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Action Table */}
      <Card>
        <CardHeader className="py-4 border-b border-navy-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-navy-900">Recent Customer Inquiries</CardTitle>
            <p className="text-xs text-navy-500 mt-0.5">Prioritize open and in-progress customer complaints</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/support/tickets')}>
            View All ({tickets.length})
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading support queue...</div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Support Tickets!</h3>
              <p className="text-sm text-navy-500 mt-1">All customer complaints and inquiries are resolved.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Ticket # / Subject</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Linked Shipment</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {tickets.slice(0, 8).map((t) => (
                    <tr key={t.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/support/tickets/${t.id}`}
                          className="font-bold text-navy-900 hover:text-primary-600 transition-colors block"
                        >
                          {t.subject}
                        </Link>
                        <span className="text-xs font-mono text-navy-400">
                          #{t.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">{t.customerName || 'Customer'}</div>
                        {t.customerEmail && <div className="text-xs text-navy-400">{t.customerEmail}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {t.trackingNumber ? (
                          <Link
                            to={`/shipments/${t.shipmentId || t.trackingNumber}`}
                            className="font-mono text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                          >
                            <Package className="h-3.5 w-3.5" /> {t.trackingNumber}
                          </Link>
                        ) : (
                          <span className="text-xs text-navy-400 italic">General Inquiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <TicketStatusBadge status={t.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-500">
                        {formatFriendlyDate(t.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenStatusModal(t)}
                          className="h-8 px-2.5 text-xs"
                        >
                          Change Status
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/support/tickets/${t.id}`)}
                          className="h-8 px-3 text-xs"
                        >
                          Manage
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

      {/* Quick Status Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Update Ticket #${selectedTicket.id.substring(0, 8)}`}
        >
          <div className="space-y-4">
            {updateError && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-500">Subject:</span>
                <span className="font-semibold text-navy-900">{selectedTicket.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Current Status:</span>
                <TicketStatusBadge status={selectedTicket.status} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-1">
                New Resolution Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="OPEN">OPEN (Awaiting Attention)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Agent Investigating)</option>
                <option value="RESOLVED">RESOLVED (Solution Provided)</option>
                <option value="CLOSED">CLOSED (Issue Closed)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button variant="ghost" onClick={() => setSelectedTicket(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmStatusUpdate} isLoading={isUpdating}>
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
