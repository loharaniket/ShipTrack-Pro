import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LifeBuoy, AlertTriangle, Clock, MessageSquare, Plus, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';

export function SupportAgentDashboard() {
  const navigate = useNavigate();
  
  const [exceptions, setExceptions] = useState([
    { id: 1, trackingId: 'STP-9382', s: 'High', type: 'Delivery Delayed', desc: 'Customer reported package not received.', t: '15m ago', stat: 'Open' },
    { id: 2, trackingId: 'STP-1123', s: 'Critical', type: 'Missing POD', desc: 'Driver marked delivered but no signature.', t: '1h ago', stat: 'Investigating' },
    { id: 3, trackingId: 'STP-5541', s: 'Medium', type: 'Address Issue', desc: 'Gate code missing.', t: '2h ago', stat: 'Pending Cust' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newException, setNewException] = useState({ trackingId: '', type: 'Delivery Delayed', s: 'Medium', desc: '' });

  const handleAddException = () => {
    if (!newException.trackingId) return;
    setExceptions([{
      id: Date.now(),
      trackingId: newException.trackingId,
      s: newException.s,
      type: newException.type,
      desc: newException.desc || 'New exception logged.',
      t: 'Just now',
      stat: 'Open'
    }, ...exceptions]);
    setIsModalOpen(false);
    setNewException({ trackingId: '', type: 'Delivery Delayed', s: 'Medium', desc: '' });
  };

  const handleResolve = (id: number) => {
    setExceptions(exceptions.filter(e => e.id !== id));
  };

  const openCases = exceptions.length + 39; // Base fake number + current active mock cases

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Support Dashboard</h1>
          <p className="text-navy-500 mt-1">Manage customer escalations and shipment issues</p>
        </div>
        <div className="flex space-x-3 items-center">
          <div className="w-64">
            <Input placeholder="Search tracking ID..." className="bg-white" />
          </div>
          <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Log Issue</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{openCases}</div>
              <LifeBuoy className="h-8 w-8 text-info-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Shipment Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-warning-600">18</div>
              <AlertTriangle className="h-8 w-8 text-warning-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Customer Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-danger-600">5</div>
              <MessageSquare className="h-8 w-8 text-danger-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy-500">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">2.4h</div>
              <Clock className="h-8 w-8 text-navy-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Exceptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Shipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-navy-500">No active exceptions.</TableCell>
                </TableRow>
              )}
              {exceptions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><Badge variant={row.s === 'Critical' ? 'danger' : row.s === 'High' ? 'warning' : 'info'}>{row.s}</Badge></TableCell>
                  <TableCell className="font-medium text-primary-600">{row.trackingId}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="text-navy-500 max-w-xs truncate">{row.desc}</TableCell>
                  <TableCell>{row.t}</TableCell>
                  <TableCell>{row.stat}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-success-600 hover:text-success-700 hover:bg-success-50" onClick={() => handleResolve(row.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Issue">
        <div className="space-y-4">
          <Input 
            placeholder="Tracking ID (e.g. STP-1234)" 
            value={newException.trackingId} 
            onChange={(e) => setNewException({...newException, trackingId: e.target.value})} 
          />
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={newException.type}
            onChange={(e) => setNewException({...newException, type: e.target.value})}
          >
            <option value="Delivery Delayed">Delivery Delayed</option>
            <option value="Address Issue">Address Issue</option>
            <option value="Missing POD">Missing POD</option>
            <option value="Damaged Goods">Damaged Goods</option>
          </select>
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={newException.s}
            onChange={(e) => setNewException({...newException, s: e.target.value})}
          >
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <Input 
            placeholder="Brief description" 
            value={newException.desc} 
            onChange={(e) => setNewException({...newException, desc: e.target.value})} 
          />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddException}>Create Issue</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
