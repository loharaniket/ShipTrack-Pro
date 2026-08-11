import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MapPin, Navigation, Clock, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

export function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Good morning, {user?.name}</h1>
        <p className="text-navy-500 mt-1">Track your recent shipments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Shipments', value: '3' },
          { label: 'In Transit', value: '1' },
          { label: 'Out for Delivery', value: '1' },
          { label: 'Delivered', value: '12' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-navy-500">{stat.label}</p>
              <p className="text-3xl font-bold text-navy-900 mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-navy-900 text-white border-0 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Package className="w-48 h-48" />
        </div>
        <CardContent className="p-8 relative z-10">
          <h2 className="text-xl font-bold mb-4">Track a Shipment</h2>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <Input 
              placeholder="Enter tracking number" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
              icon={<Search className="text-white/50 h-5 w-5" />}
            />
            <Button size="lg" className="bg-white text-navy-900 hover:bg-navy-50 h-12">
              Track Shipment
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Active Deliveries</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-navy-100">
            <div>
              <CardTitle className="text-base">STP-2026-10482</CardTitle>
              <p className="text-sm text-navy-500 mt-1">Last updated: 10 mins ago</p>
            </div>
            <Badge variant="info">In Transit</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-navy-700">
                <MapPin className="h-4 w-4 mr-2 text-navy-400" /> Origin: Mumbai
              </div>
              <div className="flex items-center text-navy-700">
                <Navigation className="h-4 w-4 mr-2 text-navy-400" /> Dest: Pune
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Progress</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                <div className="h-full bg-info-500 w-[65%]" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-sm font-medium text-navy-900">
                <Clock className="h-4 w-4 mr-2 text-primary-500" />
                ETA: 2:30 PM Today
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
