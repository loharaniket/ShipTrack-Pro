import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Truck, MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function MyRoute() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Route</h1>
          <p className="text-navy-500 mt-1">Route Execution Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle className="text-lg">Route Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-navy-500">Route ID</p>
                <p className="font-bold text-navy-900 text-lg">RT-1025</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-navy-500">Status</p>
                  <Badge variant="info">In Progress</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-navy-500">Vehicle</p>
                  <p className="font-medium text-navy-900">MH-12-AB-4821</p>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-navy-900">Progress</span>
                  <span className="font-bold text-primary-600">3 / 8 Stops</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-[37.5%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle className="text-lg">Stops</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-navy-100">
                {/* Completed Stop */}
                <div className="p-4 bg-success-50/50 flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle className="h-6 w-6 text-success-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-navy-900">1. Warehouse</h4>
                      <Badge variant="success">Completed</Badge>
                    </div>
                    <p className="text-sm text-navy-600">Mumbai DC</p>
                  </div>
                </div>

                {/* Current Stop */}
                <div className="p-4 border-l-4 border-primary-500 bg-primary-50/30 flex items-start gap-4">
                  <div className="mt-1">
                    <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs border-2 border-primary-500">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <Badge className="mb-2" variant="info">Current Stop</Badge>
                        <h4 className="font-bold text-navy-900">ABC Retail (STP-2026-10481)</h4>
                      </div>
                      <Badge variant="default">In Transit</Badge>
                    </div>
                    <p className="text-sm text-navy-600 mb-3">Pune Business Park</p>
                    
                    <div className="flex space-x-3">
                      <Button onClick={() => navigate('/shipments/STP-2026-10481')}>View Details</Button>
                      <Button variant="outline"><Navigation className="h-4 w-4 mr-2" /> Navigate</Button>
                    </div>
                  </div>
                </div>

                {/* Upcoming Stops */}
                <div className="p-4 flex items-start gap-4 opacity-75">
                  <div className="mt-1">
                    <div className="h-6 w-6 rounded-full bg-navy-100 text-navy-500 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-navy-900">XYZ Store (STP-2026-10485)</h4>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <p className="text-sm text-navy-600">Surat</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
