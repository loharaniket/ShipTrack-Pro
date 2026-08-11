import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, MapPin } from 'lucide-react';

export function Geofencing() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Geofencing</h1>
          <p className="text-navy-500 mt-1">Manage geographic boundaries and alerts</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" /> Create Geo-fence</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <Card className="md:col-span-1 flex flex-col h-full">
          <CardHeader>
            <CardTitle>Active Fences</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Mumbai DC', type: 'Radius', active: true },
                  { name: 'Pune Hub', type: 'Radius', active: true },
                  { name: 'High Traffic Zone', type: 'Polygon', active: false },
                  { name: 'Restricted Area B', type: 'Polygon', active: true },
                ].map((f, i) => (
                  <TableRow key={i} className="cursor-pointer hover:bg-navy-50">
                    <TableCell className="font-medium text-navy-900">{f.name}</TableCell>
                    <TableCell className="text-navy-500 text-sm">{f.type}</TableCell>
                    <TableCell>
                      <Badge variant={f.active ? 'success' : 'default'}>{f.active ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-full flex flex-col overflow-hidden">
          <div className="flex-1 bg-navy-100 flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/20 border-2 border-primary-500 rounded-full flex items-center justify-center">
               <MapPin className="text-primary-600 h-6 w-6" />
            </div>
            <p className="text-navy-500 font-medium absolute bottom-4 right-4 bg-white/80 px-2 py-1 rounded">Mumbai DC Radius Preview</p>
          </div>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <CardHeader className="border-b border-navy-100">
              <CardTitle>Create Geo-fence</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Name</label>
                  <input className="w-full border border-navy-300 rounded p-2 text-sm" placeholder="e.g. Warehouse A" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Type</label>
                    <select className="w-full border border-navy-300 rounded p-2 text-sm">
                      <option>Radius</option>
                      <option>Polygon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Radius (m)</label>
                    <input className="w-full border border-navy-300 rounded p-2 text-sm" type="number" defaultValue={500} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Trigger Events</label>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm"><input type="checkbox" className="mr-2 rounded text-primary-600" defaultChecked /> On Enter</label>
                    <label className="flex items-center text-sm"><input type="checkbox" className="mr-2 rounded text-primary-600" defaultChecked /> On Exit</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-navy-100">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={() => setShowModal(false)}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
