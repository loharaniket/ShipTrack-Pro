import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Navigation, Truck, User, Calendar, Map, CheckCircle2 } from 'lucide-react';

export function ShipmentDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-navy-900">{id}</h1>
          <Badge variant="info">In Transit</Badge>
          <Badge variant="warning">High Priority</Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Assign Driver</Button>
          <Link to={`/tracking/${id}`}>
            <Button variant="outline"><Map className="h-4 w-4 mr-2" /> Live Tracking</Button>
          </Link>
          <Button>Update Status</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle>Delivery Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-navy-500 mb-1">Origin</p>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-navy-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy-900">Mumbai Distribution Center</p>
                      <p className="text-sm text-navy-600">Andheri East, Mumbai</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-navy-500 mb-1">Destination</p>
                  <div className="flex items-start">
                    <Navigation className="h-5 w-5 text-navy-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy-900">Pune Business Park</p>
                      <p className="text-sm text-navy-600">Hinjewadi, Pune</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-navy-900">Delivery Progress</span>
                  <span className="font-medium text-primary-600">78%</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-[78%]" />
                </div>
                <div className="flex justify-between text-xs text-navy-500 mt-2">
                  <span>Picked up</span>
                  <span>In transit</span>
                  <span>Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-navy-200 ml-3 space-y-8 pb-4">
                {[
                  { title: 'In Transit - Approaching Pune', time: '10:42 AM Today', loc: 'Lonavala', status: 'current' },
                  { title: 'Departed Facility', time: '08:15 AM Today', loc: 'Mumbai DC', status: 'past' },
                  { title: 'Picked Up', time: '07:30 AM Today', loc: 'Mumbai DC', status: 'past' },
                  { title: 'Shipment Created', time: '06:00 PM Yesterday', loc: 'System', status: 'past' },
                ].map((event, i) => (
                  <div key={i} className="relative pl-6">
                    {event.status === 'current' ? (
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-50" />
                    ) : (
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-navy-300" />
                    )}
                    <h4 className={`text-sm font-semibold ${event.status === 'current' ? 'text-primary-700' : 'text-navy-900'}`}>{event.title}</h4>
                    <p className="text-sm text-navy-500 mt-0.5">{event.time} • {event.loc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Driver & Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mt-2">
                <div className="h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-navy-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-navy-900">Rahul Sharma</p>
                  <p className="text-xs text-navy-500">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center mt-4 pt-4 border-t border-navy-100">
                <div className="h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-navy-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-navy-900">MH-12-AB-4821</p>
                  <p className="text-xs text-navy-500">Heavy Truck (Refrigerated)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ETA Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-navy-400 mr-3" />
                <div>
                  <p className="text-sm text-navy-500">Predicted Arrival</p>
                  <p className="font-semibold text-navy-900">Today, 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center text-success-600 bg-success-50 p-2 rounded text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                On track for delivery SLA
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
