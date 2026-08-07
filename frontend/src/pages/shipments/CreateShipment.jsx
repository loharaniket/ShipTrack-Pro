import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';

const CreateShipment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderCountry: '',
    senderZip: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverCity: '',
    receiverState: '',
    receiverCountry: '',
    receiverZip: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    contentDescription: '',
    priority: 'NORMAL'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderAddress: {
          line1: formData.senderAddress,
          city: formData.senderCity,
          state: formData.senderState,
          country: formData.senderCountry,
          postalCode: formData.senderZip,
        },
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        receiverAddress: {
          line1: formData.receiverAddress,
          city: formData.receiverCity,
          state: formData.receiverState,
          country: formData.receiverCountry,
          postalCode: formData.receiverZip,
        },
        packages: [
          {
            weightKg: parseFloat(formData.weight),
            dimensionsCm: `${formData.length}x${formData.width}x${formData.height}`,
            contentDescription: formData.contentDescription || "Standard package"
          }
        ],
        priority: formData.priority
      };

      await api.post('/shipments', payload);
      navigate('/shipments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Shipment</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter shipment details to generate a tracking number.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-4 bg-[var(--color-status-error)] text-white rounded-md">{error}</div>}
        
        <div className="glass p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Sender Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="senderName" value={formData.senderName} onChange={handleChange} required placeholder="John Doe" />
            <Input label="Phone Number" name="senderPhone" value={formData.senderPhone} onChange={handleChange} required placeholder="+1 234 567 890" />
            <Input label="Address Line 1" name="senderAddress" value={formData.senderAddress} onChange={handleChange} required className="md:col-span-2" />
            <Input label="City" name="senderCity" value={formData.senderCity} onChange={handleChange} required />
            <Input label="State/Province" name="senderState" value={formData.senderState} onChange={handleChange} required />
            <Input label="Country" name="senderCountry" value={formData.senderCountry} onChange={handleChange} required />
            <Input label="Zip/Postal Code" name="senderZip" value={formData.senderZip} onChange={handleChange} required />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Receiver Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="receiverName" value={formData.receiverName} onChange={handleChange} required placeholder="Jane Smith" />
            <Input label="Phone Number" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} required />
            <Input label="Address Line 1" name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} required className="md:col-span-2" />
            <Input label="City" name="receiverCity" value={formData.receiverCity} onChange={handleChange} required />
            <Input label="State/Province" name="receiverState" value={formData.receiverState} onChange={handleChange} required />
            <Input label="Country" name="receiverCountry" value={formData.receiverCountry} onChange={handleChange} required />
            <Input label="Zip/Postal Code" name="receiverZip" value={formData.receiverZip} onChange={handleChange} required />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Package Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} type="number" step="0.1" required />
            <Input label="Length (cm)" name="length" value={formData.length} onChange={handleChange} type="number" required />
            <Input label="Width (cm)" name="width" value={formData.width} onChange={handleChange} type="number" required />
            <Input label="Height (cm)" name="height" value={formData.height} onChange={handleChange} type="number" required />
            
            <Input label="Content Description" name="contentDescription" value={formData.contentDescription} onChange={handleChange} required placeholder="Electronics, Clothing, etc." className="md:col-span-2" />
            
            <div className="flex flex-col space-y-1 md:col-span-3">
              <label className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="px-3 py-2 border rounded-md shadow-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/shipments')}>Cancel</Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
