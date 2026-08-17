import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  HelpCircle, Plus, RefreshCw, AlertCircle, CheckCircle2, 
  MessageSquare, ArrowRight, Eye, Clock 
} from 'lucide-react';
import { supportService, SupportTicket } from '@/services/supportService';
import { TicketStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function MyTickets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justCreated = searchParams.get('created') === 'true';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportService.getMyTickets();
      setTickets(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Support Tickets</h1>
          <p className="text-sm text-navy-500 mt-1">
            Track inquiries, complaints, and resolution status with our support agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchTickets} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => navigate('/customer/tickets/create')} className="h-10">
            <Plus className="h-4 w-4 mr-2" /> Raise New Ticket
          </Button>
        </div>
      </div>

      {justCreated && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>Your support ticket has been submitted. An agent will review it shortly.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tickets List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading support tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-navy-800">No support tickets found</h3>
              <p className="text-sm text-navy-500 mt-1 mb-4">
                You haven't raised any complaints or support tickets.
              </p>
              <Button onClick={() => navigate('/customer/tickets/create')}>Raise a Ticket</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Ticket Subject</th>
                    <th className="px-6 py-3.5">Related Shipment</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Submitted Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/customer/tickets/${ticket.id}`}
                          className="font-semibold text-navy-900 hover:text-primary-600"
                        >
                          {ticket.subject}
                        </Link>
                        <p className="text-xs text-navy-500 line-clamp-1 mt-0.5 max-w-md">
                          {ticket.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {ticket.trackingNumber ? (
                          <Link
                            to={`/tracking/${ticket.trackingNumber}`}
                            className="text-primary-600 hover:underline font-bold"
                          >
                            {ticket.trackingNumber}
                          </Link>
                        ) : (
                          <span className="text-navy-400">General Inquiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-500">
                        {formatFriendlyDate(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
                          className="h-8 px-3 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
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
