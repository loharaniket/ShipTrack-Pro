import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

export function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-900">Customer Directory</h1>
        <div className="flex max-w-sm w-full">
           <Input placeholder="Search customers..." icon={<Search className="h-4 w-4" />} />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Active Shipments</TableHead>
                <TableHead>SLA Performance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { c: 'Ramesh Singh', comp: 'Acme Retail', e: 'ramesh@acme.com', as: 12, sla: '99.1%', stat: 'Active' },
                { c: 'Priya Patel', comp: 'Nova Electronics', e: 'priya@nova.com', as: 5, sla: '98.5%', stat: 'Active' },
                { c: 'Sanjay Mishra', comp: 'UrbanCart', e: 'sanjay@urbancart.in', as: 28, sla: '95.2%', stat: 'At Risk' },
              ].map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.c}</TableCell>
                  <TableCell>{r.comp}</TableCell>
                  <TableCell className="text-navy-500">{r.e}</TableCell>
                  <TableCell>{r.as}</TableCell>
                  <TableCell className={r.sla < '98%' ? 'text-warning-600' : 'text-success-600'}>{r.sla}</TableCell>
                  <TableCell>
                    <Badge variant={r.stat === 'At Risk' ? 'warning' : 'success'}>{r.stat}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
