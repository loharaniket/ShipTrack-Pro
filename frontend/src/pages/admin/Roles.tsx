import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function Roles() {
  const permissions = ['View Shipments', 'Create Shipments', 'Edit Shipments', 'Delete Shipments', 'Manage Users', 'Manage Roles', 'View Analytics'];

  const [roles, setRoles] = useState(['Administrator', 'LogisticsOperator', 'SupportAgent', 'BusinessClient', 'Customer', 'Driver']);
  
  // Matrix state: matrix[role][permission] = boolean
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const initialMatrix: Record<string, Record<string, boolean>> = {};
    roles.forEach(r => {
      initialMatrix[r] = {};
      permissions.forEach(p => {
        initialMatrix[r][p] = (r === 'Administrator') || 
                              (r === 'LogisticsOperator' && !p.includes('Manage')) ||
                              (r === 'SupportAgent' && !p.includes('Manage') && !p.includes('Delete')) ||
                              (r === 'BusinessClient' && (p === 'View Shipments' || p === 'Create Shipments' || p === 'View Analytics')) ||
                              (r === 'Customer' && p === 'View Shipments') ||
                              (r === 'Driver' && p === 'View Shipments');
      });
    });
    return initialMatrix;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const handleToggle = (role: string, permission: string) => {
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim() || roles.includes(newRoleName)) return;
    const role = newRoleName.trim();
    setRoles([...roles, role]);
    
    // Initialize new role with all false permissions
    const newPerms: Record<string, boolean> = {};
    permissions.forEach(p => newPerms[p] = false);
    
    setMatrix(prev => ({ ...prev, [role]: newPerms }));
    setNewRoleName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">RBAC Management</h1>
          <p className="text-navy-500 mt-1">Role and Permission Matrix</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Role</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 bg-navy-50 sticky left-0 z-10">Permission \ Role</TableHead>
                {roles.map(r => (
                  <TableHead key={r} className="text-center bg-navy-50">{r}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">{p}</TableCell>
                  {roles.map((r) => (
                    <TableCell key={r} className="text-center border-l border-navy-100">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary-600 h-4 w-4 cursor-pointer" 
                        checked={matrix[r]?.[p] || false} 
                        onChange={() => handleToggle(r, p)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Role">
        <div className="space-y-4">
          <Input 
            placeholder="Role Name (e.g. FinanceAdmin)" 
            value={newRoleName} 
            onChange={(e) => setNewRoleName(e.target.value)} 
          />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
