import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
<<<<<<< HEAD
import { ArrowLeft, Save, PackagePlus, Trash2, CheckCircle } from 'lucide-react';
=======
import { ArrowLeft, Save, Plus, Trash2, ArrowRight } from 'lucide-react';
>>>>>>> feat/route_management_service

const CreateShipment = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const isInternal = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'SUPPORT_AGENT'].includes(currentUser?.role);
=======
  const hasAccess = ['ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'BUSINESS_CLIENT'].includes(currentUser?.role);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form state
>>>>>>> feat/route_management_service

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
<<<<<<< HEAD
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
=======
    
    priority: 'NORMAL'
  });

  const [packages, setPackages] = useState([
    { weightKg: '', dimensionsCm: '', contentDescription: '' }
  ]);
>>>>>>> feat/route_management_service

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePackageChange = (index, field, value) => {
<<<<<<< HEAD
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const addPackage = () => {
    setPackages([...packages, { weightKg: '', length: '', width: '', height: '', contentDescription: '' }]);
=======
    const newPackages = [...packages];
    newPackages[index][field] = value;
    setPackages(newPackages);
  };

  const addPackage = () => {
    setPackages([...packages, { weightKg: '', dimensionsCm: '', contentDescription: '' }]);
>>>>>>> feat/route_management_service
  };

  const removePackage = (index) => {
    if (packages.length > 1) {
<<<<<<< HEAD
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
=======
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

>>>>>>> feat/route_management_service
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
<<<<<<< HEAD
        packages: packages.map(p => ({
          weightKg: parseFloat(p.weightKg),
          dimensionsCm: `${p.length}x${p.width}x${p.height}`,
          contentDescription: p.contentDescription || "Standard package"
=======
        packages: packages.map(pkg => ({
          weightKg: parseFloat(pkg.weightKg),
          dimensionsCm: pkg.dimensionsCm,
          contentDescription: pkg.contentDescription
>>>>>>> feat/route_management_service
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

<<<<<<< HEAD
  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12 pb-12">
      <div className="flex items-center gap-4 border-b pb-4 border-gray-200 dark:border-gray-800">
=======
  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. You do not have permission to create shipments.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12 px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4">
>>>>>>> feat/route_management_service
        <Button variant="ghost" className="px-2" onClick={() => navigate('/shipments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
<<<<<<< HEAD
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
=======
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
>>>>>>> feat/route_management_service
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
<<<<<<< HEAD
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
=======
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
>>>>>>> feat/route_management_service
                    </div>
                  </div>
                </div>
              ))}
            </div>

<<<<<<< HEAD
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-1 block">Shipment Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full md:w-1/3 px-3 py-2 border rounded-md shadow-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
=======
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
>>>>>>> feat/route_management_service
              </select>
            </div>
          </div>
        )}

<<<<<<< HEAD
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
=======
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
>>>>>>> feat/route_management_service
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;
