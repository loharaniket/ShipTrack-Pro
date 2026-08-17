import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Package, Truck, MapPin, User, Phone, Calendar, ArrowLeft, 
  HelpCircle, CheckCircle2, AlertCircle, FileText, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { shipmentService, CustomerShipmentItem, PodResponse } from '@/services/shipmentService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';

export function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<CustomerShipmentItem | null>(null);
  const [pod, setPod] = useState<PodResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadDetails(id);
    }
  }, [id]);

  const loadDetails = async (shipmentId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await shipmentService.getShipmentById(shipmentId);
      setShipment(data);

      if (data.status === 'DELIVERED') {
        try {
          const podData = await shipmentService.getShipmentPod(shipmentId);
          setPod(podData);
        } catch (podErr) {
          // POD might not exist or failed to load
          console.warn('POD not available:', podErr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-navy-400">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading shipment details...
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Shipment Not Found</h2>
        <p className="text-sm text-navy-500">{error || 'The requested shipment does not exist or you do not have permission to view it.'}</p>
        <Button onClick={() => navigate('/shipments')}>Back to My Shipments</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')} className="text-navy-600 self-start">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shipments
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/customer/tickets/create?shipmentId=${shipment.id}`)}
          >
            <HelpCircle className="h-4 w-4 mr-2" /> Report Issue / Complaint
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/tracking/${shipment.trackingNumber}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Public Timeline
          </Button>
        </div>
      </div>

      {/* Main Header Banner */}
      <Card className="bg-white border-navy-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-navy-900 font-mono tracking-tight">
                  {shipment.trackingNumber}
                </h1>
                <ShipmentStatusBadge status={shipment.status} />
              </div>
              <p className="text-xs text-navy-500 mt-1">
                Created on {formatFriendlyDate(shipment.createdAt)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold uppercase text-navy-400">Total Weight</span>
              <p className="text-lg font-bold text-navy-800">{shipment.weight} kg</p>
            </div>
          </div>

          {/* Sender & Receiver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Sender */}
            <div className="bg-navy-50/60 rounded-xl p-5 border border-navy-100 space-y-3">
              <div className="flex items-center gap-2 text-navy-900 font-semibold text-sm">
                <User className="h-4 w-4 text-primary-600" /> Sender Information
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium text-navy-900">{shipment.senderName}</p>
                {shipment.senderPhone && (
                  <p className="text-navy-600 flex items-center gap-1.5 text-xs">
                    <Phone className="h-3 w-3 text-navy-400" /> {shipment.senderPhone}
                  </p>
                )}
                <p className="text-navy-600 flex items-start gap-1.5 text-xs pt-1">
                  <MapPin className="h-3.5 w-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                  <span>{shipment.pickupAddress}</span>
                </p>
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-navy-50/60 rounded-xl p-5 border border-navy-100 space-y-3">
              <div className="flex items-center gap-2 text-navy-900 font-semibold text-sm">
                <Truck className="h-4 w-4 text-primary-600" /> Delivery Destination
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium text-navy-900">{shipment.receiverName}</p>
                {shipment.receiverPhone && (
                  <p className="text-navy-600 flex items-center gap-1.5 text-xs">
                    <Phone className="h-3 w-3 text-navy-400" /> {shipment.receiverPhone}
                  </p>
                )}
                <p className="text-navy-600 flex items-start gap-1.5 text-xs pt-1">
                  <MapPin className="h-3.5 w-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                  <span>{shipment.deliveryAddress}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Package Description */}
          {shipment.packageDescription && (
            <div className="mt-6 pt-4 border-t border-navy-100 text-sm">
              <span className="text-xs font-semibold uppercase text-navy-400">Package Contents: </span>
              <span className="text-navy-800 font-medium">{shipment.packageDescription}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proof of Delivery (POD) Section if delivered */}
      {pod && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="py-4 border-b border-emerald-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Proof of Delivery (POD)
            </CardTitle>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              Delivered at {formatFriendlyDate(pod.deliveryTime)}
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs uppercase text-navy-500 font-semibold">Received by</span>
                  <p className="text-base font-bold text-navy-900 mt-0.5">{pod.receiverName}</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-navy-500 font-semibold">Timestamp</span>
                  <p className="text-sm text-navy-700 mt-0.5">{new Date(pod.deliveryTime).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase text-navy-500 font-semibold block mb-2">Delivery Photo / Signature</span>
                {pod.photoUrl ? (
                  <div className="rounded-xl overflow-hidden border border-navy-200 bg-white max-w-sm">
                    <img
                      src={pod.photoUrl}
                      alt={`POD for ${shipment.trackingNumber}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-navy-50 rounded-xl text-center text-xs text-navy-400 border border-navy-200">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 text-navy-300" />
                    No image available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Tracking Timeline */}
      <Card>
        <CardHeader className="py-4 border-b border-navy-100">
          <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" /> Tracking Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {shipment.timeline && shipment.timeline.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-200">
              {shipment.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-white border-2 border-primary-600 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
            <p className="text-sm text-navy-500 text-center py-6">
              Initial status recorded as <strong>{shipment.status}</strong>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
