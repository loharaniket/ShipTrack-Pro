import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Plus, Trash2, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { organizationApi, OrganizationResponse, OrganizationMemberResponse } from '@/services/api/organizationApi';
import { userApi } from '@/services/api/userApi';

export function Organizations() {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState({ name: '', code: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Add Org State
  const [newOrg, setNewOrg] = useState({ name: '', code: '', email: '' });
  
  // Members State
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const res = await organizationApi.getAll(0, 50);
      setOrganizations(res.content);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleAddOrganization = async () => {
    try {
      await organizationApi.create(newOrg);
      setIsAddModalOpen(false);
      setNewOrg({ name: '', code: '', email: '' });
      fetchOrganizations();
    } catch (err) {
      console.error('Failed to create organization', err);
    }
  };

  const openMembersModal = async (org: OrganizationResponse) => {
    setSelectedOrg(org);
    setIsMembersModalOpen(true);
    setIsMembersLoading(true);
    try {
      const [membersRes, usersRes] = await Promise.all([
        organizationApi.getMembers(org.id),
        userApi.getAll(0, 1000)
      ]);
      setMembers(membersRes.content || []);
      
      const fetchedUsers = usersRes.content || [];
      const businessClients = fetchedUsers.filter((u: any) => u.roles && u.roles.includes('BUSINESS_CLIENT'));
      
      setAllUsers(businessClients);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setIsMembersLoading(false);
    }
  };

  const openEditModal = async (org: OrganizationResponse) => {
    setSelectedOrg(org);
    setIsEditModalOpen(true);
    setEditLoading(true);
    try {
      const res = await organizationApi.getById(org.id);
      setEditOrg({ name: res.name, code: res.code, email: res.email || '' });
    } catch (err) {
      console.error('Failed to load organization', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;
    try {
      await organizationApi.update(selectedOrg.id, editOrg);
      setIsEditModalOpen(false);
      fetchOrganizations();
    } catch (err) {
      console.error('Failed to update organization', err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrg || !selectedUserId) return;
    try {
      await organizationApi.addMember(selectedOrg.id, selectedUserId);
      const membersRes = await organizationApi.getMembers(selectedOrg.id);
      setMembers(membersRes.content);
      setSelectedUserId('');
    } catch (err) {
      console.error('Failed to add member', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedOrg) return;
    try {
      await organizationApi.removeMember(selectedOrg.id, userId);
      setMembers(members.filter(m => m.userId !== userId));
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-900">Organizations</h1>
        <div className="flex gap-4">
          <div className="w-64">
             <Input 
               placeholder="Search organizations..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Organization</Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-navy-500">Loading...</TableCell></TableRow>
              ) : filteredOrgs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-navy-500">No organizations found.</TableCell></TableRow>
              ) : (
                filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.code}</TableCell>
                    <TableCell className="text-navy-500">{org.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={org.status === 'ACTIVE' ? 'success' : 'secondary'}>{org.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openMembersModal(org)}>
                        <Users className="h-4 w-4 mr-2" /> Members
                      </Button>
                      <Button variant="secondary" size="sm" className="ml-2" onClick={() => openEditModal(org)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Organization Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Organization">
        <div className="space-y-4">
          <Input 
            label="Organization Name"
            placeholder="e.g. Acme Corp" 
            value={newOrg.name} 
            onChange={(e) => setNewOrg({...newOrg, name: e.target.value})} 
          />
          <Input 
            label="Organization Code"
            placeholder="e.g. ACME"
            value={newOrg.code} 
            onChange={(e) => setNewOrg({...newOrg, code: e.target.value})} 
          />
          <Input 
            label="Contact Email"
            placeholder="contact@acmecorp.com"
            type="email"
            value={newOrg.email} 
            onChange={(e) => setNewOrg({...newOrg, email: e.target.value})} 
          />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddOrganization} disabled={!newOrg.name || !newOrg.code}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Organization Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Organization">
        <div className="space-y-4">
          <Input 
            label="Organization Name"
            placeholder="e.g. Acme Corp" 
            value={editOrg.name} 
            onChange={(e) => setEditOrg({ ...editOrg, name: e.target.value })} 
            disabled={editLoading}
          />
          <Input 
            label="Organization Code"
            placeholder="e.g. ACME"
            value={editOrg.code} 
            onChange={(e) => setEditOrg({ ...editOrg, code: e.target.value })} 
            disabled={editLoading}
          />
          <Input 
            label="Contact Email"
            placeholder="contact@acmecorp.com"
            type="email"
            value={editOrg.email} 
            onChange={(e) => setEditOrg({ ...editOrg, email: e.target.value })} 
            disabled={editLoading}
          />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleUpdateOrganization} disabled={editLoading || !editOrg.name || !editOrg.code}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Manage Members Modal */}
      <Modal isOpen={isMembersModalOpen} onClose={() => setIsMembersModalOpen(false)} title={`Manage Members: ${selectedOrg?.name}`}>
        <div className="space-y-6">
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-navy-700 mb-1">Assign User (Business Client)</label>
              <select 
                className="w-full border border-navy-300 rounded-md p-2 text-sm bg-white"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Select a User --</option>
                {allUsers.filter(u => !members.some(m => m.userId === u.id)).map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddMember} disabled={!selectedUserId}>Assign</Button>
          </div>

          <div>
            <h4 className="text-sm font-medium text-navy-900 mb-2">Current Members</h4>
            {isMembersLoading ? (
              <p className="text-sm text-navy-500">Loading...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-navy-500">No members assigned.</p>
            ) : (
              <div className="border border-navy-200 rounded-md divide-y divide-navy-100">
                {members.map(m => (
                  <div key={m.userId} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-navy-500">{m.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" onClick={() => handleRemoveMember(m.userId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </Modal>
    </div>
  );
}
