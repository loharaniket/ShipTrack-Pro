import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';

const ShipmentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await api.get('/shipments');
      // The backend returns a Page object inside ApiResponse
      // response.data.data.content contains the array of shipments
      setShipments(response.data.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.receiverDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage and track all your deliveries.</p>
        </div>
        <Button onClick={() => navigate('/shipments/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Shipment
        </Button>
      </div>

      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tracking number or receiver..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" className="gap-2 hidden sm:flex">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3 font-medium">Tracking Number</th>
                <th className="px-6 py-3 font-medium">Receiver</th>
                <th className="px-6 py-3 font-medium">Destination</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--color-brand)]">{shipment.trackingNumber}</td>
                    <td className="px-6 py-4">{shipment.receiverName || shipment.receiverDetails?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{shipment.receiverCity || shipment.receiverAddress?.city || shipment.receiverDetails?.city || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{shipment.priority}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={shipment.status} />
                    </td>
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
        </div>
      </div>
    </div>
  );
};

export default ShipmentList;
