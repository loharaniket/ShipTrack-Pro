import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function Users() {
  const [users, setUsers] = useState([
    { id: 1, u: 'Aniket Lohar', e: 'admin@shiptrack.pro', r: 'Administrator', o: 'ShipTrack', m: 'Enabled', s: 'Active' },
    { id: 2, u: 'Support Team', e: 'support@shiptrack.pro', r: 'SupportAgent', o: 'ShipTrack', m: 'Enabled', s: 'Active' },
    { id: 3, u: 'Logistics Ops', e: 'operator@shiptrack.pro', r: 'LogisticsOperator', o: 'Mumbai Hub', m: 'Disabled', s: 'Active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ u: '', e: '', r: 'SupportAgent', o: 'ShipTrack', m: 'Disabled', s: 'Active' });

  const handleAddUser = () => {
    if (!newUser.u || !newUser.e) return;
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setIsModalOpen(false);
    setNewUser({ u: '', e: '', r: 'SupportAgent', o: 'ShipTrack', m: 'Disabled', s: 'Active' });
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">User Management</h1>
          <p className="text-navy-500 mt-1">Platform-wide user administration</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Invite User</Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-navy-500">No users found.</TableCell>
                </TableRow>
              )}
              {users.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.u}</TableCell>
                  <TableCell className="text-navy-500">{r.e}</TableCell>
                  <TableCell><Badge variant="default">{r.r}</Badge></TableCell>
                  <TableCell>{r.o}</TableCell>
                  <TableCell>
                    <Badge variant={r.m === 'Enabled' ? 'success' : 'warning'}>{r.m}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant="success">{r.s}</Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="sm">Edit</Button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite New User">
        <div className="space-y-4">
          <Input 
            placeholder="Full Name" 
            value={newUser.u} 
            onChange={(e) => setNewUser({...newUser, u: e.target.value})} 
          />
          <Input 
            placeholder="Email Address" 
            type="email"
            value={newUser.e} 
            onChange={(e) => setNewUser({...newUser, e: e.target.value})} 
          />
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={newUser.r}
            onChange={(e) => setNewUser({...newUser, r: e.target.value})}
          >
            <option value="Administrator">Administrator</option>
            <option value="LogisticsOperator">Logistics Operator</option>
            <option value="SupportAgent">Support Agent</option>
            <option value="Driver">Driver</option>
            <option value="BusinessClient">Business Client</option>
            <option value="Customer">Customer</option>
          </select>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Send Invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
