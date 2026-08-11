import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart3, TrendingUp, TrendingDown, Package, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ExecutiveAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Executive Analytics</h1>
          <p className="text-navy-500 mt-1">High-level insights into enterprise logistics performance</p>
        </div>
        <div className="flex space-x-2">
          <select className="border border-navy-300 rounded px-3 py-2 text-sm text-navy-700 bg-white">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-navy-500 mb-2">
              <span className="text-sm font-medium">Total Shipments</span>
              <Package className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold text-navy-900">42,891</div>
            <div className="flex items-center text-sm mt-2 text-success-600 font-medium">
              <TrendingUp className="h-4 w-4 mr-1" /> +14.2%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-navy-500 mb-2">
              <span className="text-sm font-medium">Delivery Success Rate</span>
              <CheckCircle className="h-4 w-4 text-success-500" />
            </div>
            <div className="text-3xl font-bold text-navy-900">98.4%</div>
            <div className="flex items-center text-sm mt-2 text-success-600 font-medium">
              <TrendingUp className="h-4 w-4 mr-1" /> +0.8%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-navy-500 mb-2">
              <span className="text-sm font-medium">Average Delay</span>
              <Clock className="h-4 w-4 text-warning-500" />
            </div>
            <div className="text-3xl font-bold text-navy-900">42 mins</div>
            <div className="flex items-center text-sm mt-2 text-success-600 font-medium">
              <TrendingDown className="h-4 w-4 mr-1" /> -12 mins
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-navy-500 mb-2">
              <span className="text-sm font-medium">SLA Breaches</span>
              <ShieldAlert className="h-4 w-4 text-danger-500" />
            </div>
            <div className="text-3xl font-bold text-navy-900">1.2%</div>
            <div className="flex items-center text-sm mt-2 text-danger-600 font-medium">
              <TrendingUp className="h-4 w-4 mr-1" /> +0.3%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Volume Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-navy-100 bg-navy-50/50 m-4 rounded">
            <div className="text-center text-navy-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-navy-300" />
              <p>Chart.js Line Chart Visualization</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance by Region</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-navy-100 bg-navy-50/50 m-4 rounded">
             <div className="text-center text-navy-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-navy-300" />
              <p>Chart.js Bar Chart Visualization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
