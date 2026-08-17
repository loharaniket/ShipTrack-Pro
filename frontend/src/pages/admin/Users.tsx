import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Users as UsersIcon, Search, Filter, RefreshCw, 
  AlertCircle, ShieldCheck, Mail, Phone, Calendar 
} from 'lucide-react';
import { adminService, SystemUser, PageResponse } from '@/services/adminService';
import { formatFriendlyDate } from '@/utils/dateFormatter';

export function Users() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers(0, 100, roleFilter !== 'ALL' ? roleFilter : undefined);
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray((data as PageResponse<SystemUser>).content)) {
        setUsers((data as PageResponse<SystemUser>).content);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch platform users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`;
    return (
      name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term))
    );
  });

  const getRoleBadge = (user: SystemUser) => {
    const roles = user.roles || (user.role ? [user.role] : ['CUSTOMER']);
    const primary = roles[0] || 'CUSTOMER';

    switch (primary.toUpperCase()) {
      case 'ADMINISTRATOR':
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">ADMIN</span>;
      case 'DRIVER':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">DRIVER</span>;
      case 'SUPPORT_AGENT':
      case 'SUPPORT':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">SUPPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">CUSTOMER</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
          <p className="text-sm text-navy-500 mt-1">
            System accounts across Customer, Driver, Support Agent, and Administrator roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchUsers} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
              <Input
                placeholder="Search user name, email, phone..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-navy-500 flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="DRIVER">Drivers</option>
                <option value="SUPPORT_AGENT">Support Agents</option>
                <option value="ADMINISTRATOR">Administrators</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading user accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center">
              <UsersIcon className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Users Found</h3>
              <p className="text-sm text-navy-500 mt-1">No user accounts matched the filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredUsers.map((user) => {
                    const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

                    return (
                      <tr key={user.id} className="hover:bg-navy-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-navy-900">{name}</div>
                              <div className="text-xs font-mono text-navy-400">{user.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-navy-700">
                            <Mail className="h-3.5 w-3.5 text-navy-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-navy-600">
                          {user.phone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-navy-400" />
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-navy-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(user)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {user.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-navy-500">
                          {formatFriendlyDate(user.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
