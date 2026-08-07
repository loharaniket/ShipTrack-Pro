import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';

const EditShipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    // Just keeping it simple for now, can expand later
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const response = await api.get(`/shipments/${id}`);
      const ship = response.data.data;
      setFormData({
        status: ship.status || 'CREATED',
        priority: ship.priority || 'NORMAL',
      });
    } catch (err) {
      setError('Failed to fetch shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Assuming PUT /shipments/{id} accepts these fields
      await api.put(`/shipments/${id}`, formData);
      navigate(`/shipments/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shipment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading shipment data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate(`/shipments/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Shipment</h1>
          <p className="text-gray-500 dark:text-gray-400">Update status and priority.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl shadow-sm space-y-6">
        {error && <div className="p-4 bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] rounded-md text-sm">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="px-3 py-2 border rounded-md shadow-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800">
              <option value="CREATED">Created</option>
              <option value="PICKED UP">Picked Up</option>
              <option value="IN TRANSIT">In Transit</option>
              <option value="OUT FOR DELIVERY">Out For Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="EXCEPTION">Exception</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="px-3 py-2 border rounded-md shadow-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800">
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={() => navigate(`/shipments/${id}`)}>Cancel</Button>
          <Button type="submit" className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditShipment;
