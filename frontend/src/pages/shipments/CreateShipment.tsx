import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateShipment() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const steps = [
    'Information',
    'Origin',
    'Destination',
    'Packages',
    'Delivery Options',
    'Review'
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Input label="Order ID" placeholder="ORD-2026-XXXX" />
            <Input label="Customer" placeholder="Select Customer" />
            <Input label="Shipment Type" placeholder="Standard / Express" />
            <Input label="Reference Number" placeholder="Optional" />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Input label="Contact Name" />
            <Input label="Company" />
            <Input label="Address" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" />
              <Input label="Email" type="email" />
            </div>
          </div>
        );
      // Simplify the rest for demo purposes
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-900">Review Shipment Details</h3>
            <div className="bg-navy-50 p-4 rounded border border-navy-200 text-sm space-y-2">
              <p><span className="text-navy-500 w-24 inline-block">Order ID:</span> ORD-2026-1048</p>
              <p><span className="text-navy-500 w-24 inline-block">Origin:</span> Mumbai DC</p>
              <p><span className="text-navy-500 w-24 inline-block">Dest:</span> Pune Business Park</p>
              <p><span className="text-navy-500 w-24 inline-block">Packages:</span> 2 Pallets</p>
            </div>
          </div>
        );
      default:
        return <div className="py-8 text-center text-navy-500">Step {step} content goes here...</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-900">Create Shipment</h1>
        <Button variant="ghost" onClick={() => navigate('/shipments')}>Cancel</Button>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-navy-200 -z-10" />
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 
              ${step > i + 1 ? 'bg-primary-600 border-primary-600 text-white' : 
                step === i + 1 ? 'bg-white border-primary-600 text-primary-600' : 'bg-white border-navy-300 text-navy-400'}`}
            >
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${step >= i + 1 ? 'text-navy-900' : 'text-navy-400'}`}>{s}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step} — {steps[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="mt-8 pt-4 border-t border-navy-200 flex justify-between">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>
              Back
            </Button>
            <Button onClick={() => {
              if (step < 6) setStep(s => s + 1);
              else navigate('/shipments');
            }}>
              {step === 6 ? 'Create Shipment' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
