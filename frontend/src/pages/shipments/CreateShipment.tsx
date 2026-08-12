import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateShipment() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [packages, setPackages] = useState([
    { id: 1, description: '', weight: '', fragile: false }
  ]);

  const steps = [
    'Shipment Details',
    'Packages',
    'Destination',
    'Review'
  ];

  const addPackage = () => {
    setPackages([...packages, { id: Date.now(), description: '', weight: '', fragile: false }]);
  };

  const removePackage = (id: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  const updatePackage = (id: number, field: string, value: any) => {
    setPackages(packages.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 max-w-md">
            <Input label="Customer Name" placeholder="e.g. Acme Corp" />
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Shipment Type</label>
              <select className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option>Standard Delivery (3-5 Days)</option>
                <option>Express Delivery (1-2 Days)</option>
                <option>Same Day Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Priority</label>
              <select className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option>Standard</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 max-w-2xl">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className="p-4 border border-navy-200 rounded-lg bg-navy-50/50 relative">
                <h4 className="text-sm font-semibold text-navy-900 mb-4">Package {index + 1}</h4>
                {packages.length > 1 && (
                  <button 
                    onClick={() => removePackage(pkg.id)}
                    className="absolute top-4 right-4 text-navy-400 hover:text-danger-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input 
                    label="Contents Description" 
                    placeholder="e.g. Electronics" 
                    value={pkg.description}
                    onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
                  />
                  <Input 
                    label="Weight (kg)" 
                    type="number" 
                    placeholder="e.g. 12.5" 
                    value={pkg.weight}
                    onChange={(e) => updatePackage(pkg.id, 'weight', e.target.value)}
                  />
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id={`fragile-${pkg.id}`}
                    checked={pkg.fragile}
                    onChange={(e) => updatePackage(pkg.id, 'fragile', e.target.checked)}
                    className="rounded border-navy-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor={`fragile-${pkg.id}`} className="text-sm font-medium text-navy-700">This package is fragile</label>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addPackage} className="w-full border-dashed border-2">
              <Plus className="h-4 w-4 mr-2" /> Add Another Package
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 max-w-md">
            <Input label="Recipient Name" placeholder="Full Name" />
            <Input label="Delivery Address" placeholder="Street, City, Zip Code" />
            <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-900">Review Shipment Details</h3>
            <div className="bg-navy-50 p-4 rounded-lg border border-navy-200 text-sm space-y-3 max-w-md">
              <div className="flex justify-between border-b border-navy-100 pb-2">
                <span className="text-navy-500">Tracking ID:</span>
                <span className="font-medium text-primary-600">(Auto-generated)</span>
              </div>
              <div className="flex justify-between border-b border-navy-100 pb-2">
                <span className="text-navy-500">Customer:</span>
                <span className="font-medium">Acme Corp</span>
              </div>
              <div className="flex justify-between border-b border-navy-100 pb-2">
                <span className="text-navy-500">Total Packages:</span>
                <span className="font-medium">{packages.length} Packages</span>
              </div>
              <div className="flex justify-between border-b border-navy-100 pb-2">
                <span className="text-navy-500">Type:</span>
                <span className="font-medium">Express Delivery</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Destination:</span>
                <span className="font-medium text-right">Pune Business Park</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-900">Create New Shipment</h1>
        <Button variant="ghost" onClick={() => navigate('/shipments')}>Cancel</Button>
      </div>

      <div className="flex items-center justify-between mb-8 relative px-4">
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-navy-200 -z-10" />
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center bg-navy-50 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors
              ${step > i + 1 ? 'bg-primary-600 border-primary-600 text-white' : 
                step === i + 1 ? 'bg-white border-primary-600 text-primary-600' : 'bg-white border-navy-300 text-navy-400'}`}
            >
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${step >= i + 1 ? 'text-navy-900' : 'text-navy-400'}`}>{s}</span>
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-white border-b border-navy-100 pb-4">
          <CardTitle className="text-lg">Step {step}: {steps[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStep()}
          
          <div className="mt-8 pt-4 border-t border-navy-100 flex justify-between items-center">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>
              Back
            </Button>
            <Button size="lg" className="px-8" onClick={() => {
              if (step < 4) setStep(s => s + 1);
              else navigate('/shipments');
            }}>
              {step === 4 ? 'Confirm & Create' : 'Next Step'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
