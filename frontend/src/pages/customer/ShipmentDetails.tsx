import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Package, Truck, MapPin, User, Phone, Calendar, ArrowLeft, 
  HelpCircle, CheckCircle2, AlertCircle, FileText, ExternalLink, Image as ImageIcon,
  Navigation, Radio
} from 'lucide-react';
import { shipmentService, CustomerShipmentItem, PodResponse } from '@/services/shipmentService';
import { liveTrackingService, DriverLocationDto } from '@/services/liveTrackingService';
import { ShipmentStatusBadge } from '@/components/common/ShipmentStatusBadge';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';

export function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<CustomerShipmentItem | null>(null);
  const [pod, setPod] = useState<PodResponse | null>(null);
  const [liveLocation, setLiveLocation] = useState<DriverLocationDto | null>(null);
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

      if (data.status === 'OUT_FOR_DELIVERY' || data.status === 'IN_TRANSIT') {
        try {
          const loc = await liveTrackingService.getShipmentLiveLocation(shipmentId);
          setLiveLocation(loc);
        } catch (e) {
          // No live session yet
        }
      }

      if (data.status === 'DELIVERED') {
        try {
          const podData = await shipmentService.getShipmentPod(shipmentId);
          setPod(podData);
        } catch (podErr) {
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

  const isLiveTrackingAvailable = ['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(shipment.status) || !!liveLocation;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-navy-600 self-start">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <div className="flex items-center gap-3">
          {isLiveTrackingAvailable && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/shipments/${shipment.id}/live-tracking`)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <Navigation className="h-4 w-4" /> Live Driver Tracking
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/customer/tickets/create?shipmentId=${shipment.id}`)}
          >
            <HelpCircle className="h-4 w-4 mr-2" /> Report Issue
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tracking/${shipment.trackingNumber}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Public Timeline
          </Button>
        </div>
      </div>

      {/* LIVE DRIVER BANNER */}
      {isLiveTrackingAvailable && (
        <div className="bg-gradient-to-r from-primary-900 to-navy-900 text-white rounded-2xl p-5 shadow-md border border-primary-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Live Telemetry
              </span>
              {liveLocation?.driverName && (
                <span className="text-xs text-navy-200">
                  Driver: <strong className="text-white">{liveLocation.driverName}</strong>
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">Your parcel is out for delivery!</h3>
            <p className="text-xs text-navy-200">
              Watch real-time GPS courier movement and estimated arrival on the live interactive map.
            </p>
          </div>

          <Button
            onClick={() => navigate(`/shipments/${shipment.id}/live-tracking`)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold whitespace-nowrap"
          >
            <Navigation className="h-4 w-4 mr-2" /> Open Live Map
          </Button>
        </div>
      )}

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
      {shipment.status === 'DELIVERED' && pod && (
        <Card className="border-emerald-200 bg-emerald-50/20 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-emerald-100/70 pb-3">
            <CardTitle className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Proof of Delivery (POD) Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-navy-500">Receiver / Signee</span>
                  <p className="text-base font-bold text-navy-900 mt-0.5">{pod.receiverName}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-navy-500">Delivered At</span>
                  <p className="text-sm font-medium text-navy-800 mt-0.5">
                    {formatFriendlyDate(pod.deliveryTime)} ({formatRelativeTime(pod.deliveryTime)})
                  </p>
                </div>
              </div>

              {pod.photoUrl && (
                <div>
                  <span className="text-xs font-semibold uppercase text-navy-500 block mb-2">
                    Delivery Photo / Signature
                  </span>
                  <div className="relative group max-w-sm rounded-xl overflow-hidden border border-navy-200 shadow-sm">
                    <img
                      src={pod.photoUrl}
                      alt="Proof of delivery"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <a
                      href={pod.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5"
                    >
                      <ImageIcon className="h-4 w-4" /> View Full Image
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Journey Tracking History */}
      <Card>
        <CardHeader className="border-b border-navy-100 pb-3">
          <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-500" /> Milestone Tracking History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {shipment.trackingHistory && shipment.trackingHistory.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-navy-200">
              {shipment.trackingHistory.map((item, idx) => (
                <div key={item.id || idx} className="relative flex items-start gap-4">
                  <div className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="bg-navy-50/70 rounded-xl p-4 border border-navy-100 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <ShipmentStatusBadge status={item.status} />
                      <span className="text-xs text-navy-400 font-mono">
                        {formatFriendlyDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-navy-800">{item.description}</p>
                    {item.updatedBy && (
                      <p className="text-xs text-navy-500">Updated by: {item.updatedBy}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-navy-400 text-sm">
              No tracking events recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
