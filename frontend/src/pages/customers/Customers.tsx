import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export function Customers() {
  const [customers, setCustomers] = useState([
    { id: 1, c: 'Ramesh Singh', comp: 'Acme Retail', e: 'ramesh@acme.com', as: 12, sla: '99.1%', stat: 'Active' },
    { id: 2, c: 'Priya Patel', comp: 'Nova Electronics', e: 'priya@nova.com', as: 5, sla: '98.5%', stat: 'Active' },
    { id: 3, c: 'Sanjay Mishra', comp: 'UrbanCart', e: 'sanjay@urbancart.in', as: 28, sla: '95.2%', stat: 'At Risk' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ c: '', comp: '', e: '', as: 0, sla: '100%', stat: 'Active' });

  const handleAddCustomer = () => {
    if (!newCustomer.c || !newCustomer.comp) return;
    setCustomers([...customers, { ...newCustomer, id: Date.now() }]);
    setIsModalOpen(false);
    setNewCustomer({ c: '', comp: '', e: '', as: 0, sla: '100%', stat: 'Active' });
  };

  const handleDelete = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-900">Customer Directory</h1>
        <div className="flex gap-4">
          <div className="w-64">
             <Input placeholder="Search customers..." icon={<Search className="h-4 w-4" />} />
          </div>
          <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Customer</Button>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-navy-500">No customers found.</TableCell>
                </TableRow>
              )}
              {customers.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.c}</TableCell>
                  <TableCell>{r.comp}</TableCell>
                  <TableCell className="text-navy-500">{r.e}</TableCell>
                  <TableCell>{r.as}</TableCell>
                  <TableCell className={r.sla < '98%' ? 'text-warning-600' : 'text-success-600'}>{r.sla}</TableCell>
                  <TableCell>
                    <Badge variant={r.stat === 'At Risk' ? 'warning' : 'success'}>{r.stat}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
        <div className="space-y-4">
          <Input 
            placeholder="Contact Name" 
            value={newCustomer.c} 
            onChange={(e) => setNewCustomer({...newCustomer, c: e.target.value})} 
          />
          <Input 
            placeholder="Company Name" 
            value={newCustomer.comp} 
            onChange={(e) => setNewCustomer({...newCustomer, comp: e.target.value})} 
          />
          <Input 
            placeholder="Email Address" 
            type="email"
            value={newCustomer.e} 
            onChange={(e) => setNewCustomer({...newCustomer, e: e.target.value})} 
          />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
