import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle2, ArrowRight, AlertCircle, Copy, Check } from 'lucide-react';
import { shipmentService, CreateShipmentResponse } from '@/services/shipmentService';

export function CreateShipment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [weight, setWeight] = useState<string>('1.0');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdResult, setCreatedResult] = useState<CreateShipmentResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMsg('Please enter a valid weight in kg.');
      return;
    }

    if (!senderPhone.trim() || !receiverPhone.trim()) {
      setErrorMsg('Please provide both sender and receiver phone numbers.');
      return;
    }

    if (!pickupAddress.trim() || !deliveryAddress.trim()) {
      setErrorMsg('Please specify complete pickup and delivery addresses.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await shipmentService.createShipment({
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: deliveryAddress.trim(),
        packageDescription: packageDescription.trim() || 'General Package',
        weight: weightNum
      });

      setCreatedResult(response);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create shipment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTracking = () => {
    if (createdResult?.trackingNumber) {
      navigator.clipboard.writeText(createdResult.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setReceiverName('');
    setReceiverPhone('');
    setPickupAddress('');
    setDeliveryAddress('');
    setPackageDescription('');
    setWeight('1.0');
    setCreatedResult(null);
  };

  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border-emerald-200 bg-white shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy-900">Shipment Created Successfully!</h2>
              <p className="text-sm text-navy-500 mt-1">
                Your delivery request has been booked and queued for dispatch.
              </p>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
              <p className="text-xs uppercase font-semibold text-navy-500 tracking-wider">Tracking Number</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-3xl font-extrabold text-primary-600 font-mono tracking-tight">
                  {createdResult.trackingNumber}
                </span>
                <button
                  onClick={copyTracking}
                  className="p-2 rounded-lg bg-white border border-navy-200 text-navy-600 hover:text-primary-600 hover:border-primary-300 transition-colors"
                  title="Copy Tracking Number"
                >
                  {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-navy-400 mt-2">Initial Status: <strong className="text-navy-700">CREATED</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/tracking/${createdResult.trackingNumber}`)}
                className="h-11 px-6"
              >
                Track Live
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/shipments/${createdResult.id}`)}
                className="h-11 px-6"
              >
                View Details <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-11 px-4 text-navy-600"
              >
                Book Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Book a New Shipment</h1>
        <p className="text-sm text-navy-500 mt-1">
          Provide package and contact details to initiate your shipment.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700 border-b border-navy-100 pb-2">
                1. Sender Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sender Full Name"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Rahul Patil"
                />
                <Input
                  label="Sender Phone Number"
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <Input
                label="Pickup Address"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Complete street address, area, city, pincode"
              />
            </div>

            {/* Receiver Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700 border-b border-navy-100 pb-2">
                2. Recipient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Receiver Full Name"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                />
                <Input
                  label="Receiver Phone Number"
                  type="tel"
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="e.g. 9876543211"
                />
              </div>
              <Input
                label="Delivery Address"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Complete destination address, landmark, city, pincode"
              />
            </div>

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700 border-b border-navy-100 pb-2">
                3. Package Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Package Description"
                    required
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    placeholder="e.g. Dell Laptop / Documents / Clothes"
                  />
                </div>
                <div>
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="1.5"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/shipments')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="h-11 px-8 font-semibold"
                isLoading={isSubmitting}
              >
                Confirm & Create Shipment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
