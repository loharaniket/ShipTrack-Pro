import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, Package, Truck, CheckCircle2, Clock, MapPin, 
  ArrowLeft, AlertCircle, ShieldCheck 
} from 'lucide-react';
import { trackingService, PublicTrackingResponse } from '@/services/trackingService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate } from '@/utils/dateFormatter';

const STEPS = [
  { key: 'CREATED', label: 'Booked' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' }
];

export function TrackShipment() {
  const { trackingNumber: routeTrackingNumber, id } = useParams<{ trackingNumber?: string; id?: string }>();
  const initialNumber = routeTrackingNumber || id || '';

  const navigate = useNavigate();
  const [query, setQuery] = useState(initialNumber);
  const [trackingData, setTrackingData] = useState<PublicTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialNumber) {
      setQuery(initialNumber);
      fetchTracking(initialNumber);
    }
  }, [initialNumber]);

  const fetchTracking = async (num: string) => {
    if (!num.trim()) return;
    try {
      setLoading(true);
      setError('');
      const data = await trackingService.getPublicTracking(num.trim());
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || 'Tracking number not found. Please check and try again.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tracking/${encodeURIComponent(query.trim())}`);
      fetchTracking(query.trim());
    }
  };

  const getStepIndex = (status: string) => {
    const s = (status || '').toUpperCase();
    return STEPS.findIndex(step => step.key === s);
  };

  const currentStepIdx = trackingData ? getStepIndex(trackingData.currentStatus) : -1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Search Bar */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-navy-900">Shipment Live Tracking</h1>
        <p className="text-sm text-navy-500">
          Enter your shipment tracking ID to get instant milestone updates
        </p>
      </div>

      <Card className="shadow-lg border-navy-200">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-navy-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Tracking Number (e.g. STP10001)"
                className="pl-10 h-11 text-base font-mono uppercase"
              />
            </div>
            <Button type="submit" variant="primary" className="h-11 px-6 font-semibold" isLoading={loading}>
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error View */}
      {error && (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Tracking Information Not Found</h3>
            <p className="text-sm text-rose-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tracking Results View */}
      {trackingData && (
        <div className="space-y-6">
          {/* Status Progress Header */}
          <Card className="border-navy-200 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-6">
                <div>
                  <span className="text-xs uppercase font-semibold text-navy-400">Tracking Number</span>
                  <h2 className="text-2xl font-black text-navy-900 font-mono tracking-tight mt-0.5">
                    {trackingData.trackingNumber}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy-500 font-medium">Status:</span>
                  <ShipmentStatusBadge status={trackingData.currentStatus} />
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-6 gap-2 text-center relative">
                  {STEPS.map((step, idx) => {
                    const isPassed = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center space-y-2">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCurrent
                              ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-navy-100 text-navy-400'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isCurrent
                              ? 'text-primary-700 font-bold'
                              : isPassed
                              ? 'text-navy-900'
                              : 'text-navy-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chronological Timeline */}
          <Card>
            <CardHeader className="py-4 border-b border-navy-100">
              <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-600" /> Milestone Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {trackingData.timeline && trackingData.timeline.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-200">
                  {trackingData.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-white border-2 border-primary-600 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ShipmentStatusBadge status={event.status} />
                          <span className="text-xs text-navy-400 font-mono">
                            {formatFriendlyDate(event.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-navy-800">{event.description}</p>
                        {event.location && (
                          <p className="text-xs text-navy-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-navy-500 text-center py-6">No milestone updates logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
