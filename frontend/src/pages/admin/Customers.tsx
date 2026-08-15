import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { userApi } from '@/services/api/userApi';

export function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [editingCustomer, setEditingCustomer] = useState<null | {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
  }>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any = await userApi.getAll();
      const all: any[] = data.content || [];
      const filtered = all.filter(u => (u.roles && u.roles.includes('CUSTOMER')));
      setCustomers(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.password) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        password: newCustomer.password,
        roles: ['CUSTOMER']
      };
      await userApi.create(payload);
      setIsAddModalOpen(false);
      setNewCustomer({ firstName: '', lastName: '', email: '', password: '' });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (cust: any) => {
    setEditingCustomer({
      id: cust.id,
      firstName: cust.firstName,
      lastName: cust.lastName,
      phone: cust.phone || '',
      status: cust.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    try {
      setIsSubmitting(true);
      await userApi.update(editingCustomer.id, {
        firstName: editingCustomer.firstName,
        lastName: editingCustomer.lastName,
        phone: editingCustomer.phone,
        status: editingCustomer.status,
        roles: ['CUSTOMER']
      });
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userApi.update(id, { status: newStatus });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to change status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-900">Customers</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-500" />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-navy-500">No customers found.</TableCell>
                </TableRow>
              ) : (
                customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                    <TableCell className="text-navy-500">{c.email}</TableCell>
                    <TableCell>{c.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'warning'}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(c)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" onClick={() => toggleStatus(c.id, c.status)}>
                        {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Customer Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Customer">
        <div className="space-y-4">
          <Input placeholder="First Name" value={newCustomer.firstName} onChange={e => setNewCustomer({ ...newCustomer, firstName: e.target.value })} />
          <Input placeholder="Last Name" value={newCustomer.lastName} onChange={e => setNewCustomer({ ...newCustomer, lastName: e.target.value })} />
          <Input placeholder="Email" type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
          <Input placeholder="Password" type="password" value={newCustomer.password} onChange={e => setNewCustomer({ ...newCustomer, password: e.target.value })} />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddCustomer} disabled={isSubmitting}>Add</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Customer">
        <div className="space-y-4">
          <Input placeholder="First Name" value={editingCustomer?.firstName || ''} onChange={e => setEditingCustomer(editingCustomer ? { ...editingCustomer, firstName: e.target.value } : null)} />
          <Input placeholder="Last Name" value={editingCustomer?.lastName || ''} onChange={e => setEditingCustomer(editingCustomer ? { ...editingCustomer, lastName: e.target.value } : null)} />
          <Input placeholder="Phone" value={editingCustomer?.phone || ''} onChange={e => setEditingCustomer(editingCustomer ? { ...editingCustomer, phone: e.target.value } : null)} />
          <select className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2" value={editingCustomer?.status || 'ACTIVE'} onChange={e => setEditingCustomer(editingCustomer ? { ...editingCustomer, status: e.target.value } : null)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleUpdateCustomer} disabled={isSubmitting}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
