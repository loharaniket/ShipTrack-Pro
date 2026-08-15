import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { userApi } from '@/services/api/userApi';

const ROLE_DISPLAY_MAP: Record<string, string> = {
  ADMINISTRATOR: 'Administrator',
  DRIVER: 'Driver',
  BUSINESS_CLIENT: 'Business Client',
  CUSTOMER: 'Customer',
};

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newUser, setNewUser] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    role: 'DRIVER' 
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    status: string;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any = await userApi.getAll();
      // data.content holds the page list based on standard Pageable
      setUsers(data.content || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const createReq = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        roles: [newUser.role]
      };

      await userApi.create(createReq);
      
      // Reset and close
      setIsModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'DRIVER' });
      
      // Refresh list
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;

    try {
      // Soft delete by updating status
      await userApi.update(id, { status: 'INACTIVE' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
      console.error(err);
    }
  };

  const openEditModal = (user: any) => {
    const primaryRole = (user.roles && user.roles.length > 0) ? user.roles[0] : 'CUSTOMER';
    setEditingUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: primaryRole,
      status: user.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.firstName || !editingUser.lastName) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const updateReq = {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        phone: editingUser.phone,
        status: editingUser.status,
        roles: [editingUser.role]
      };

      await userApi.update(editingUser.id, updateReq);
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-500" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-navy-500">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map((r) => {
                  const primaryRole = (r.roles && r.roles.length > 0) ? r.roles[0] : 'UNKNOWN';
                  const displayRole = ROLE_DISPLAY_MAP[primaryRole] || primaryRole;
                  
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{`${r.firstName} ${r.lastName}`}</TableCell>
                      <TableCell className="text-navy-500">{r.email}</TableCell>
                      <TableCell><Badge variant="default">{displayRole}</Badge></TableCell>
                      <TableCell>{r.phone || 'N/A'}</TableCell>
                      <TableCell>
                         <Badge variant={r.status === 'ACTIVE' ? 'success' : r.status === 'INACTIVE' ? 'warning' : 'default'}>
                           {r.status || 'ACTIVE'}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(r)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite New User">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="First Name" 
              value={newUser.firstName} 
              onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} 
            />
            <Input 
              placeholder="Last Name" 
              value={newUser.lastName} 
              onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} 
            />
          </div>
          <Input 
            placeholder="Email Address" 
            type="email"
            value={newUser.email} 
            onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
          />
          <Input 
            placeholder="Initial Password" 
            type="password"
            value={newUser.password} 
            onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
          />
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
          >
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="DRIVER">Driver</option>
            <option value="BUSINESS_CLIENT">Business Client</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="First Name" 
              value={editingUser?.firstName || ''} 
              onChange={(e) => setEditingUser(editingUser ? {...editingUser, firstName: e.target.value} : null)} 
            />
            <Input 
              placeholder="Last Name" 
              value={editingUser?.lastName || ''} 
              onChange={(e) => setEditingUser(editingUser ? {...editingUser, lastName: e.target.value} : null)} 
            />
          </div>
          <Input 
            placeholder="Phone Number" 
            value={editingUser?.phone || ''} 
            onChange={(e) => setEditingUser(editingUser ? {...editingUser, phone: e.target.value} : null)} 
          />
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={editingUser?.role || 'CUSTOMER'}
            onChange={(e) => setEditingUser(editingUser ? {...editingUser, role: e.target.value} : null)}
          >
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="DRIVER">Driver</option>
            <option value="BUSINESS_CLIENT">Business Client</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          <select 
            className="w-full bg-white border border-navy-300 text-navy-900 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
            value={editingUser?.status || 'ACTIVE'}
            onChange={(e) => setEditingUser(editingUser ? {...editingUser, status: e.target.value} : null)}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
