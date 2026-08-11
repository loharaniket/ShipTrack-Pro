import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Report Center</h1>
          <p className="text-navy-500 mt-1">Generate and export global reports</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Report Type</label>
              <select className="w-full border border-navy-300 rounded p-2 text-sm bg-white">
                <option>Shipment Report</option>
                <option>Delivery Report</option>
                <option>SLA Report</option>
                <option>Delay Report</option>
                <option>POD Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Date Range</label>
              <select className="w-full border border-navy-300 rounded p-2 text-sm bg-white">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="pt-4 border-t border-navy-100 flex gap-2">
              <Button className="flex-1" variant="outline">Preview</Button>
              <Button className="flex-1">Generate</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { n: 'August Shipment Summary', t: 'Shipment Report', d: 'Today, 10:00 AM' },
                  { n: 'Q2 SLA Compliance', t: 'SLA Report', d: 'Yesterday, 2:15 PM' },
                  { n: 'Weekly Delay Analysis', t: 'Delay Report', d: 'Aug 5, 2026' },
                ].map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary-500" />
                      {r.n}
                    </TableCell>
                    <TableCell>{r.t}</TableCell>
                    <TableCell className="text-navy-500 text-sm">{r.d}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4 text-navy-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
