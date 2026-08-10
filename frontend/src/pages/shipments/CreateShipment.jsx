import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Save, Plus, Trash2, ArrowRight } from 'lucide-react';

const CreateShipment = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const hasAccess = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form state

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddressLine1: '',
    senderCity: '',
    senderState: '',
    senderCountry: '',
    senderZip: '',
    
    receiverName: '',
    receiverPhone: '',
    receiverAddressLine1: '',
    receiverCity: '',
    receiverState: '',
    receiverCountry: '',
    receiverZip: '',
    
    priority: 'NORMAL'
  });

  const [packages, setPackages] = useState([
    { weightKg: '', dimensionsCm: '', contentDescription: '' }
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...packages];
    newPackages[index][field] = value;
    setPackages(newPackages);
  };

  const addPackage = () => {
    setPackages([...packages, { weightKg: '', dimensionsCm: '', contentDescription: '' }]);
  };

  const removePackage = (index) => {
    if (packages.length > 1) {
      const newPackages = [...packages];
      newPackages.splice(index, 1);
      setPackages(newPackages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const payload = {
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderAddress: {
          line1: formData.senderAddressLine1,
          city: formData.senderCity,
          state: formData.senderState,
          country: formData.senderCountry,
          postalCode: formData.senderZip
        },
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        receiverAddress: {
          line1: formData.receiverAddressLine1,
          city: formData.receiverCity,
          state: formData.receiverState,
          country: formData.receiverCountry,
          postalCode: formData.receiverZip
        },
        packages: packages.map(pkg => ({
          weightKg: parseFloat(pkg.weightKg),
          dimensionsCm: pkg.dimensionsCm,
          contentDescription: pkg.contentDescription
        })),
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

  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. You do not have permission to create shipments.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12 px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">New Shipment</h1>
          <p className="text-gray-500 dark:text-gray-400">Step {step} of 3 - {step === 1 ? 'Sender Details' : step === 2 ? 'Receiver Details' : 'Packages & Priority'}</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between relative mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 transition-all duration-300 rounded-full"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${step >= s ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            {s}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}
        
        {/* STEP 1: SENDER DETAILS */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">Sender Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Sender Name" name="senderName" value={formData.senderName} onChange={handleChange} required placeholder="Rahul Sharma" />
              <Input label="Sender Phone" name="senderPhone" value={formData.senderPhone} onChange={handleChange} required placeholder="+91 9876543210" />
              <Input label="Address Line 1" name="senderAddressLine1" value={formData.senderAddressLine1} onChange={handleChange} required className="md:col-span-2" placeholder="45 MG Road, Andheri West" />
              <Input label="City" name="senderCity" value={formData.senderCity} onChange={handleChange} required placeholder="Mumbai" />
              <Input label="State/Province" name="senderState" value={formData.senderState} onChange={handleChange} required placeholder="Maharashtra" />
              <Input label="Country" name="senderCountry" value={formData.senderCountry} onChange={handleChange} required placeholder="India" />
              <Input label="Postal Code" name="senderZip" value={formData.senderZip} onChange={handleChange} required placeholder="400053" />
            </div>
          </div>
        )}

        {/* STEP 2: RECEIVER DETAILS */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">Receiver Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Receiver Name" name="receiverName" value={formData.receiverName} onChange={handleChange} required placeholder="Priya Patel" />
              <Input label="Receiver Phone" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} required placeholder="+91 9123456789" />
              <Input label="Address Line 1" name="receiverAddressLine1" value={formData.receiverAddressLine1} onChange={handleChange} required className="md:col-span-2" placeholder="Sector 12, Dwarka" />
              <Input label="City" name="receiverCity" value={formData.receiverCity} onChange={handleChange} required placeholder="New Delhi" />
              <Input label="State/Province" name="receiverState" value={formData.receiverState} onChange={handleChange} required placeholder="Delhi" />
              <Input label="Country" name="receiverCountry" value={formData.receiverCountry} onChange={handleChange} required placeholder="India" />
              <Input label="Postal Code" name="receiverZip" value={formData.receiverZip} onChange={handleChange} required placeholder="110075" />
            </div>
          </div>
        )}

        {/* STEP 3: PACKAGES */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold">Package List</h2>
              <Button type="button" variant="outline" size="sm" onClick={addPackage} className="gap-1">
                <Plus className="h-4 w-4" /> Add Package
              </Button>
            </div>
            
            <div className="space-y-4">
              {packages.map((pkg, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  {packages.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removePackage(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-6">
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" step="0.1" required 
                        placeholder="e.g. 5.5"
                        value={pkg.weightKg} 
                        onChange={(e) => handlePackageChange(index, 'weightKg', e.target.value)}
                        className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dimensions (cm) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required 
                        placeholder="e.g. 10x20x30"
                        value={pkg.dimensionsCm} 
                        onChange={(e) => handlePackageChange(index, 'dimensionsCm', e.target.value)}
                        className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Description <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required 
                        placeholder="e.g. Books, Electronics"
                        value={pkg.contentDescription} 
                        onChange={(e) => handlePackageChange(index, 'contentDescription', e.target.value)}
                        className="px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-1 mt-6 max-w-xs">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipment Priority <span className="text-red-500">*</span></label>
              <select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange} 
                className="px-3 py-2 border rounded-md shadow-sm bg-white border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => navigate('/shipments')}>Cancel</Button>
          )}
          
          <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {step < 3 ? (
              <>Next <ArrowRight className="h-4 w-4" /></>
            ) : (
              <><Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Create Shipment'}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
