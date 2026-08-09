import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Save, PackagePlus, Trash2, CheckCircle } from 'lucide-react';

const CreateShipment = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const isInternal = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'SUPPORT_AGENT'].includes(currentUser?.role);

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
    priority: 'NORMAL'
  });

  const [packages, setPackages] = useState([{ weightKg: '', length: '', width: '', height: '', contentDescription: '' }]);

  useEffect(() => {
    if (!isInternal && currentUser) {
      // Auto-fill for customer
      setFormData(prev => ({
        ...prev,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderPhone: currentUser.phone || '',
      }));
    }
  }, [currentUser, isInternal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePackageChange = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const addPackage = () => {
    setPackages([...packages, { weightKg: '', length: '', width: '', height: '', contentDescription: '' }]);
  };

  const removePackage = (index) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
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
        packages: packages.map(p => ({
          weightKg: parseFloat(p.weightKg),
          dimensionsCm: `${p.length}x${p.width}x${p.height}`,
          contentDescription: p.contentDescription || "Standard package"
        })),
        priority: formData.priority
      };

      const res = await api.post('/shipments', payload);
      navigate(`/shipments/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12 pb-12">
      <div className="flex items-center gap-4 border-b pb-4 border-gray-200 dark:border-gray-800">
        <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Shipment</h1>
          <p className="text-gray-500 dark:text-gray-400">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-8">
        <div 
          className="bg-[var(--color-brand)] h-full transition-all duration-300 ease-in-out" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>

      {error && <div className="p-4 bg-[var(--color-status-error)] text-white rounded-md">{error}</div>}

      <div className="glass p-6 md:p-8 rounded-2xl shadow-sm min-h-[400px]">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Sender Information</h2>
              <p className="text-gray-500 text-sm">Where is this package coming from?</p>
            </div>
            
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
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Receiver Information</h2>
              <p className="text-gray-500 text-sm">Where is this package going?</p>
            </div>
            
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
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold">Package Details</h2>
                <p className="text-gray-500 text-sm">Add one or more packages for this shipment.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPackage} className="gap-2">
                <PackagePlus className="h-4 w-4" /> Add Package
              </Button>
            </div>
            
            <div className="space-y-6">
              {packages.map((pkg, index) => (
                <div key={index} className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30 relative">
                  {packages.length > 1 && (
                    <button 
                      onClick={() => removePackage(index)}
                      className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <h3 className="font-semibold mb-4">Package {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input label="Content Description" value={pkg.contentDescription} onChange={(e) => handlePackageChange(index, 'contentDescription', e.target.value)} required placeholder="Electronics, Clothing, etc." />
                    </div>
                    <div>
                      <Input label="Weight (kg)" value={pkg.weightKg} onChange={(e) => handlePackageChange(index, 'weightKg', e.target.value)} type="number" step="0.1" required />
                    </div>
                    <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-4">
                       <Input label="Length (cm)" value={pkg.length} onChange={(e) => handlePackageChange(index, 'length', e.target.value)} type="number" required />
                       <Input label="Width (cm)" value={pkg.width} onChange={(e) => handlePackageChange(index, 'width', e.target.value)} type="number" required />
                       <Input label="Height (cm)" value={pkg.height} onChange={(e) => handlePackageChange(index, 'height', e.target.value)} type="number" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-1 block">Shipment Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full md:w-1/3 px-3 py-2 border rounded-md shadow-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="mx-auto bg-[var(--color-brand)] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-[var(--color-brand)]">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Review Your Shipment</h2>
              <p className="text-gray-500">Please confirm the details before creating the order.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider mb-3">Sender</h3>
                <p className="font-medium">{formData.senderName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formData.senderPhone}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formData.senderAddress}, {formData.senderCity}, {formData.senderState} {formData.senderZip}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider mb-3">Receiver</h3>
                <p className="font-medium">{formData.receiverName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formData.receiverPhone}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formData.receiverAddress}, {formData.receiverCity}, {formData.receiverState} {formData.receiverZip}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider mb-3">Packages ({packages.length})</h3>
              <div className="space-y-2">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg text-sm">
                    <span><span className="font-medium text-gray-900 dark:text-white">Pkg {idx + 1}:</span> {pkg.contentDescription || 'Standard'}</span>
                    <span className="text-gray-500">{pkg.weightKg} kg | {pkg.length}x{pkg.width}x{pkg.height} cm</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
               <span className="font-semibold">Priority: <span className="text-[var(--color-brand)]">{formData.priority}</span></span>
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-between pt-4">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
        ) : (
          <div></div> // Spacer
        )}
        
        {step < totalSteps ? (
          <Button type="button" onClick={nextStep}>Next Step</Button>
        ) : (
          <Button type="button" className="gap-2 px-8" onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Processing...' : 'Confirm Shipment'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;
