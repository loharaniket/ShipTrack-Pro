import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  HelpCircle, MessageSquare, Package, User, Mail, Calendar, 
  ArrowLeft, CheckCircle2, AlertCircle, Clock, ExternalLink, RefreshCw 
} from 'lucide-react';
import { supportService, SupportTicket } from '@/services/supportService';
import { TicketStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function SupportTicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status Change State
  const [selectedStatus, setSelectedStatus] = useState<string>('IN_PROGRESS');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket(id);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await supportService.getTicketDetails(ticketId);
      setTicket(data);
      setSelectedStatus(data.status || 'IN_PROGRESS');
    } catch (err: any) {
      setError(err.message || 'Failed to load support ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!ticket) return;
    setIsUpdating(true);
    setError('');

    try {
      const updated = await supportService.updateTicketStatus(ticket.id, selectedStatus);
      setTicket(updated);
      setSuccessMsg(`Ticket status updated to ${selectedStatus}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-navy-400">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading ticket details...
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Support Ticket Not Found</h2>
        <p className="text-sm text-navy-500">{error}</p>
        <Button onClick={() => navigate('/support/tickets')}>Back to All Tickets</Button>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-navy-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => loadTicket(ticket.id)}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
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

      {/* Ticket Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-navy-100 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-navy-400">
                  Ticket #{ticket.id.substring(0, 8)}
                </span>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <h1 className="text-xl font-extrabold text-navy-900 mt-2">{ticket.subject}</h1>
              <p className="text-xs text-navy-400 mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Logged on {formatFriendlyDate(ticket.createdAt)}
              </p>
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center gap-2 bg-navy-50 p-2 rounded-xl border border-navy-100">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 rounded-lg border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <Button
                size="sm"
                variant="primary"
                onClick={handleUpdateStatus}
                isLoading={isUpdating}
                disabled={selectedStatus === ticket.status}
                className="h-9 text-xs"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Customer & Linked Shipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-navy-100">
            {/* Customer Details */}
            <div className="bg-navy-50/50 rounded-xl p-4 border border-navy-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-navy-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-navy-400" /> Customer Information
              </div>
              <p className="text-sm font-bold text-navy-900">{ticket.customerName || 'Customer'}</p>
              {ticket.customerEmail && (
                <p className="text-xs text-navy-600 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-navy-400" /> {ticket.customerEmail}
                </p>
              )}
            </div>

            {/* Linked Shipment Details */}
            <div className="bg-navy-50/50 rounded-xl p-4 border border-navy-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-navy-500 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-navy-400" /> Linked Shipment
              </div>
              {ticket.trackingNumber ? (
                <div>
                  <Link
                    to={`/shipments/${ticket.shipmentId || ticket.trackingNumber}`}
                    className="text-sm font-mono font-bold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    {ticket.trackingNumber} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <p className="text-xs text-navy-500 mt-1">Click to view complete shipment & delivery timeline</p>
                </div>
              ) : (
                <p className="text-xs text-navy-400 italic py-1">No shipment linked (General platform ticket)</p>
              )}
            </div>
          </div>

          {/* Complaint Description */}
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary-600" /> Customer Issue Description
            </h3>
            <div className="p-4 bg-navy-50/30 rounded-xl border border-navy-100 text-sm text-navy-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
