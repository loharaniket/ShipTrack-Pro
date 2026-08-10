import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
<<<<<<< HEAD
import { Plus, Search, Filter, ChevronRight, Package } from 'lucide-react';
=======
import { Plus, ChevronRight, ChevronLeft, Search } from 'lucide-react';
>>>>>>> feat/route_management_service
import { formatDateOnly } from '../../utils/dateFormatter';

const ShipmentList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
<<<<<<< HEAD
  const [searchTerm, setSearchTerm] = useState('');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced filters for internal staff
  const [statusFilter, setStatusFilter] = useState('');

  const isInternal = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'SUPPORT_AGENT'].includes(currentUser?.role);
=======
  
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const hasAccess = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);
  const canCreate = ['CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);
  
  const [driverAssignments, setDriverAssignments] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'LOGISTICS_OPERATOR') {
      api.get('/delivery/drivers/me/assignments')
        .then(res => setDriverAssignments(res.data.data?.map(a => a.shipmentId) || []))
        .catch(err => console.error("Failed to load assignments", err));
    }
  }, [currentUser]);
>>>>>>> feat/route_management_service

  useEffect(() => {
    fetchShipments();
  }, [page]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      const response = await api.get('/shipments?size=100');
      // The backend returns a Page object inside ApiResponse
      // response.data.data.content contains the array of shipments
      setShipments(response.data.data?.content || []);
=======
      const response = await api.get(`/shipments?page=${page}&size=10`);
      const { content, totalPages } = response.data.data;
      setShipments(content || []);
      setTotalPages(totalPages || 1);
>>>>>>> feat/route_management_service
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(s => {
<<<<<<< HEAD
    const matchesSearch = s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.receiverName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });
=======
    const matchesSearch = s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.receiverName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If user is LOGISTICS_OPERATOR and assignments have loaded, only show assigned shipments.
    const matchesDriver = currentUser?.role === 'LOGISTICS_OPERATOR' && driverAssignments 
      ? driverAssignments.includes(s.id) 
      : true;

    return matchesSearch && matchesDriver;
  });

  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. You do not have permission to view shipments.</div>;
  }
>>>>>>> feat/route_management_service

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold tracking-tight">
            {isInternal ? 'Shipment Operations' : 'My Shipments'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isInternal ? 'Manage and track all deliveries across the network.' : 'View and track your package orders.'}
          </p>
        </div>
        <Button onClick={() => navigate('/shipments/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          {isInternal ? 'Create Shipment' : 'Create New Order'}
        </Button>
      </div>

      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
=======
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shipments</h1>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/shipments/create')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            New Shipment
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
>>>>>>> feat/route_management_service
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tracking or receiver..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
<<<<<<< HEAD
          
          {isInternal && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="CREATED">CREATED</option>
                <option value="PENDING">PENDING</option>
                <option value="PICKED_UP">PICKED UP</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {isInternal ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium">Tracking Number</th>
                  <th className="px-6 py-3 font-medium">Receiver</th>
                  <th className="px-6 py-3 font-medium">Destination</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading shipments...</td></tr>
                ) : filteredShipments.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No shipments found.</td></tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-brand)]">{shipment.trackingNumber}</td>
                      <td className="px-6 py-4">{shipment.receiverName || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{shipment.receiverCity || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDateOnly(shipment.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={shipment.status} /></td>
                      <td className="p-4 align-middle">
                        <Link to={`/shipments/${shipment.id}`} className="text-[var(--color-brand)] font-medium hover:underline flex items-center gap-1 justify-end">
                          Manage <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium">Order Details</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading your orders...</td></tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p>You have no shipments yet.</p>
                      <Button variant="link" onClick={() => navigate('/shipments/create')}>Create your first order</Button>
=======
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 font-medium">Tracking Number</th>
                <th className="px-6 py-3 font-medium">Receiver</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{shipment.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{shipment.receiverName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{shipment.receiverCity}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{shipment.priority}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDateOnly(shipment.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Link to={`/shipments/${shipment.id}`} className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center">
                        View <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
>>>>>>> feat/route_management_service
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--color-brand)]">{shipment.trackingNumber}</span>
                          <span className="text-sm text-gray-500">To: {shipment.receiverName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={shipment.status} /></td>
                      <td className="p-4 align-middle">
                        <Link to={`/shipments/${shipment.id}`} className="text-[var(--color-brand)] font-medium hover:underline flex items-center gap-1 justify-end">
                          View <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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
              disabled={page === 0 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
              disabled={page >= totalPages - 1 || loading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentList;
