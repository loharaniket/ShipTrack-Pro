import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Truck, Map, ChevronRight, ChevronLeft, PackageX, Activity } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateOnly, formatDateTime } from '../../utils/dateFormatter';

const DispatchDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const hasAccess = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR'].includes(currentUser?.role);

  const [unassignedShipments, setUnassignedShipments] = useState([]);
  const [unassignedLoading, setUnassignedLoading] = useState(true);
  
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (hasAccess) {
      fetchUnassigned();
      fetchAssigned();
    }
  }, [hasAccess, page]);

  const fetchUnassigned = async () => {
    try {
      setUnassignedLoading(true);
      const res = await api.get('/shipments?assigned=false&page=0&size=50');
      setUnassignedShipments(res.data.data?.content || []);
    } catch (err) {
      console.error("Failed to load unassigned shipments", err);
    } finally {
      setUnassignedLoading(false);
    }
  };

  const fetchAssigned = async () => {
    try {
      setAssignedLoading(true);
      const res = await api.get(`/shipments?assigned=true&page=${page}&size=10`);
      setAssignedShipments(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load assigned shipments", err);
    } finally {
      setAssignedLoading(false);
    }
  };

  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. You do not have permission to view the dispatch board.</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="h-6 w-6 text-indigo-600" />
            Dispatch & Routing Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage unassigned packages and monitor active deliveries in real-time.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Unassigned Pool */}
        <div className="w-full lg:w-1/3 xl:w-1/4 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <PackageX className="h-5 w-5 text-orange-500" />
                Unassigned Pool
                <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-xs py-1 px-2 rounded-full font-bold">
                  {unassignedShipments.length}
                </span>
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {unassignedLoading ? (
                <div className="text-center py-10 text-gray-500 text-sm">Loading pool...</div>
              ) : unassignedShipments.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">No unassigned packages.</div>
              ) : (
                unassignedShipments.map(shipment => (
                  <div key={shipment.id} 
                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {shipment.trackingNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        shipment.priority === 'URGENT' || shipment.priority === 'EXPRESS' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {shipment.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                      To: {shipment.receiverName} • {shipment.receiverCity}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400">{formatDateOnly(shipment.createdAt)}</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
                        Assign <ChevronRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Column: Active Deliveries */}
        <div className="w-full lg:w-2/3 xl:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Active Deliveries (Assigned)
              </h2>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/90 z-10">
                  <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 font-medium">Tracking</th>
                    <th className="px-6 py-3 font-medium">Receiver</th>
                    <th className="px-6 py-3 font-medium">City</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Priority</th>
                    <th className="px-6 py-3 font-medium text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {assignedLoading ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading active deliveries...</td></tr>
                  ) : assignedShipments.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No active deliveries found.</td></tr>
                  ) : (
                    assignedShipments.map(shipment => (
                      <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{shipment.trackingNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{shipment.receiverName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{shipment.receiverCity}</td>
                        <td className="px-6 py-4 text-sm"><StatusBadge status={shipment.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{shipment.priority}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/shipments/${shipment.id}`)}>
                            Monitor
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.max(0, page - 1))} 
                  disabled={page === 0 || assignedLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
                  disabled={page >= totalPages - 1 || assignedLoading}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DispatchDashboard;
