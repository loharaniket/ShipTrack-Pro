import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { BrainCircuit, AlertTriangle, TrendingDown, Crosshair } from 'lucide-react';

export function ETAPrediction() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">ETA Prediction Intelligence</h1>
          <p className="text-navy-500 mt-1">AI-driven delivery forecasting and delay analysis</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Avg ETA Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-success-600">94.2%</div>
              <Crosshair className="h-8 w-8 text-success-500 opacity-20" />
            </div>
            <p className="text-xs text-navy-500 mt-2">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Predicted Delays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-warning-600">34</div>
              <TrendingDown className="h-8 w-8 text-warning-500 opacity-20" />
            </div>
            <p className="text-xs text-navy-500 mt-2">Next 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">At-Risk Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-danger-600">12</div>
              <AlertTriangle className="h-8 w-8 text-danger-500 opacity-20" />
            </div>
            <p className="text-xs text-navy-500 mt-2">Requires intervention</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-300">AI Confidence Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">High</div>
              <BrainCircuit className="h-8 w-8 text-indigo-400 opacity-50" />
            </div>
            <div className="mt-2 w-full bg-indigo-950 rounded-full h-1.5">
              <div className="bg-indigo-400 h-1.5 rounded-full w-[88%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prediction Table</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Original ETA</TableHead>
                  <TableHead>Predicted ETA</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Cause</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 'STP-2026-10481', orig: '14:00', pred: '14:05', conf: '98%', risk: 'Low', cause: 'Normal Traffic' },
                  { id: 'STP-2026-10482', orig: '15:30', pred: '16:45', conf: '85%', risk: 'High', cause: 'Severe Traffic' },
                  { id: 'STP-2026-10483', orig: '16:00', pred: '16:15', conf: '92%', risk: 'Medium', cause: 'Weather' },
                  { id: 'STP-2026-10484', orig: '09:00', pred: '11:30', conf: '75%', risk: 'Critical', cause: 'Facility Delay' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-primary-600">{row.id}</TableCell>
                    <TableCell className="text-navy-500">{row.orig}</TableCell>
                    <TableCell className="font-semibold text-navy-900">{row.pred}</TableCell>
                    <TableCell>{row.conf}</TableCell>
                    <TableCell>
                      <Badge variant={row.risk === 'Critical' ? 'danger' : row.risk === 'High' ? 'warning' : row.risk === 'Medium' ? 'info' : 'success'}>
                        {row.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{row.cause}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Delay Causes Distribution</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[
                  { cause: 'Traffic', pct: 45, color: 'bg-danger-500' },
                  { cause: 'Facility delay', pct: 25, color: 'bg-warning-500' },
                  { cause: 'Weather', pct: 15, color: 'bg-info-500' },
                  { cause: 'Driver delay', pct: 10, color: 'bg-primary-500' },
                  { cause: 'Route deviation', pct: 5, color: 'bg-success-500' },
                ].map(item => (
                  <div key={item.cause} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-700">{item.cause}</span>
                      <span className="font-medium text-navy-900">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
