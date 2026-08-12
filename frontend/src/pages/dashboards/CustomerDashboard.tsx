import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, MapPin, Navigation, Clock, Package, Truck, CheckCircle2, Box } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Good morning, {user?.name}</h1>
        <p className="text-navy-500 mt-1">Track your recent shipments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Shipments', value: '3', icon: Package, color: 'text-info-500', bg: 'bg-info-50' },
          { label: 'In Transit', value: '1', icon: Truck, color: 'text-primary-500', bg: 'bg-primary-50' },
          { label: 'Out for Delivery', value: '1', icon: Navigation, color: 'text-warning-500', bg: 'bg-warning-50' },
          { label: 'Delivered', value: '12', icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50' },
        ].map(stat => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-500">{stat.label}</p>
                <p className="text-2xl font-bold text-navy-900 leading-tight mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-lg relative overflow-hidden bg-primary-50">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Search className="w-32 h-32 text-primary-900" />
        </div>
        <CardContent className="p-8 relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-navy-900">Track a Shipment</h2>
          <p className="text-navy-600 mb-6">Enter your tracking ID below to get real-time location updates.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <Input 
              placeholder="e.g. STP-2026-10482" 
              className="h-12 bg-white flex-1 text-lg"
            />
            <Button size="lg" className="h-12 px-8 text-lg" onClick={() => navigate('/tracking/STP-2026-10482')}>
              Track Shipment
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4 flex items-center">
        <Truck className="h-5 w-5 mr-2 text-primary-500" /> Active Deliveries
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow border-primary-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-navy-100 bg-navy-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded shadow-sm">
                <Box className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy-900">STP-2026-10482</CardTitle>
                <p className="text-xs text-navy-500 mt-0.5 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> Updated 10 mins ago
                </p>
              </div>
            </div>
            <Badge variant="info" className="px-3 py-1">In Transit</Badge>
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
              <Button variant="outline" size="sm" onClick={() => navigate('/shipments/STP-2026-10482')}>View Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
