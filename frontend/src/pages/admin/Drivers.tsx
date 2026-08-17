import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, UserCheck, RefreshCw, AlertCircle, Phone, 
  Mail, ShieldCheck, Clock, Plus 
} from 'lucide-react';
import { adminService, DriverUser } from '@/services/adminService';

export function Drivers() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getDrivers();
      setDrivers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Courier Driver Fleet</h1>
          <p className="text-sm text-navy-500 mt-1">
            Registered logistics operators and active courier personnel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchDrivers} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => navigate('/admin/shipments/pending')} className="h-10">
            <Clock className="h-4 w-4 mr-2" /> Assign Deliveries
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Driver Cards / Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading driver roster...</div>
          ) : drivers.length === 0 ? (
            <div className="p-16 text-center">
              <Truck className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Drivers Registered</h3>
              <p className="text-sm text-navy-500 mt-1">
                Drivers created with the DRIVER role will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50/70 text-xs font-semibold uppercase text-navy-600 border-b border-navy-100">
                  <tr>
                    <th className="px-6 py-3.5">Driver Name</th>
                    <th className="px-6 py-3.5">Contact Email</th>
                    <th className="px-6 py-3.5">Phone Number</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {drivers.map((driver) => {
                    const fullName = driver.firstName 
                      ? `${driver.firstName} ${driver.lastName || ''}`.trim() 
                      : (driver.name || 'Driver');

                    return (
                      <tr key={driver.id} className="hover:bg-navy-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-navy-900">{fullName}</div>
                              <div className="text-xs font-mono text-navy-400">{driver.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-navy-700">
                            <Mail className="h-3.5 w-3.5 text-navy-400" />
                            <span>{driver.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-navy-600">
                          {driver.phone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-navy-400" />
                              {driver.phone}
                            </span>
                          ) : (
                            <span className="text-navy-400 italic">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {driver.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-navy-600">
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md font-semibold text-xs">
                            DRIVER
                          </span>
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
