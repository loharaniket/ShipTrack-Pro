import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, HelpCircle, AlertCircle, Clock, Package, 
  CheckCircle2, MessageSquare, ExternalLink 
} from 'lucide-react';
import { supportService, SupportTicket } from '@/services/supportService';
import { TicketStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
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

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Ticket Not Found</h2>
        <p className="text-sm text-navy-500">{error || 'The requested ticket does not exist or you do not have permission to view it.'}</p>
        <Button onClick={() => navigate('/customer/tickets')}>Back to My Tickets</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customer/tickets')} className="text-navy-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Tickets
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-navy-900">{ticket.subject}</h1>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <p className="text-xs text-navy-500 mt-1">
                Submitted on {formatFriendlyDate(ticket.createdAt)}
              </p>
            </div>

            {ticket.trackingNumber && (
              <div className="flex items-center gap-2 bg-navy-50 px-3 py-2 rounded-lg border border-navy-100">
                <Package className="h-4 w-4 text-primary-600" />
                <div className="text-xs">
                  <span className="text-navy-400 block">Related Shipment</span>
                  <Link
                    to={`/tracking/${ticket.trackingNumber}`}
                    className="font-mono font-bold text-primary-600 hover:underline"
                  >
                    {ticket.trackingNumber}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 space-y-4">
            <h3 className="text-xs uppercase font-semibold text-navy-400 tracking-wider">Complaint Details</h3>
            <div className="bg-navy-50/50 rounded-xl p-5 border border-navy-100 text-sm text-navy-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {ticket.status === 'RESOLVED' && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-900">Ticket Marked Resolved</p>
                <p className="text-emerald-700 text-xs mt-0.5">
                  Our support team has addressed this inquiry. If you require further assistance, feel free to open a new ticket.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
