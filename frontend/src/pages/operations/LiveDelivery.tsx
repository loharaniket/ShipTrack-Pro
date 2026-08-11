import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Map, X, User, Truck, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LiveDelivery() {
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6 overflow-hidden bg-navy-50">
      <div className={cn("flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 transition-all", selectedDelivery ? "pr-96" : "")}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Active Deliveries</h1>
            <p className="text-navy-500 mt-1">Monitor all vehicles and shipments in transit</p>
          </div>
          <Button variant="outline"><Map className="h-4 w-4 mr-2" /> Map View</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i} className="cursor-pointer" onClick={() => setSelectedDelivery(i)}>
                    <TableCell className="font-medium text-primary-600">STP-10{480 + i}</TableCell>
                    <TableCell>Rahul Sharma</TableCell>
                    <TableCell>MH-12-AB-4821</TableCell>
                    <TableCell>Pune Hwy</TableCell>
                    <TableCell>2:30 PM</TableCell>
                    <TableCell>
                      <div className="w-24 h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full bg-info-500" style={{ width: `${60 + i * 5}%` }} />
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={i === 2 ? 'warning' : 'success'}>{i === 2 ? 'Medium' : 'Low'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-96 bg-white border-l border-navy-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 flex flex-col mt-16",
          selectedDelivery ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-navy-200 flex justify-between items-center bg-navy-50">
          <h2 className="font-semibold text-navy-900">Delivery Details</h2>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDelivery(null)}>
            <X className="h-5 w-5 text-navy-500" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-navy-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-navy-600" />
            </div>
            <div>
              <p className="font-semibold text-navy-900">Rahul Sharma</p>
              <div className="flex items-center text-sm text-navy-500 mt-1">
                <Phone className="h-3 w-3 mr-1" /> +91 98765 43210
              </div>
            </div>
          </div>
          
          <div className="border border-navy-200 rounded-lg p-4 bg-navy-50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-navy-500">Vehicle</span>
              <span className="font-medium">MH-12-AB-4821</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-navy-500">Current Speed</span>
              <span className="font-medium text-success-600">42 km/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-navy-500">Distance Rem.</span>
              <span className="font-medium">23.4 km</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-900 mb-3">Live Map</h3>
            <div className="h-48 bg-navy-100 rounded-lg flex items-center justify-center border border-navy-200">
              <Map className="h-8 w-8 text-navy-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
