import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HelpCircle, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supportService } from '@/services/supportService';
import { shipmentService, CustomerShipmentItem } from '@/services/shipmentService';

export function CreateComplaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialShipmentId = searchParams.get('shipmentId') || '';

  const [shipments, setShipments] = useState<CustomerShipmentItem[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState(initialShipmentId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const data = await shipmentService.getMyShipments();
      setShipments(data || []);
    } catch (err) {
      console.warn('Could not pre-load shipments for ticket form', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!subject.trim() || !description.trim()) {
      setErrorMessage('Please provide both a subject and a description for your complaint.');
      return;
    }

    setIsSubmitting(true);

    try {
      await supportService.createTicket({
        shipmentId: selectedShipmentId.trim() || undefined,
        subject: subject.trim(),
        description: description.trim()
      });

      navigate('/customer/tickets?created=true');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customer/tickets')} className="text-navy-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Tickets
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">Raise a Support Ticket / Complaint</h1>
        <p className="text-sm text-navy-500 mt-1">
          Our customer support team is here to assist with delays, damaged packages, or delivery inquiries.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Related Shipment Selection */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Related Shipment (Optional)
              </label>
              <select
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="w-full h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">General Inquiry (No specific shipment)</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trackingNumber} — To: {s.receiverName} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <Input
              label="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Package delayed beyond estimated date / Address correction"
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Description of Issue
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail so our support agents can assist promptly..."
                className="w-full rounded-lg border border-navy-200 bg-white p-3 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100">
              <Button type="button" variant="ghost" onClick={() => navigate('/customer/tickets')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="h-11 px-6 font-semibold" isLoading={isSubmitting}>
                Submit Complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
