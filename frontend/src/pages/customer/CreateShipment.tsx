import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddressAutocompleteInput } from '@/components/common/AddressAutocompleteInput';
import { AddressDto } from '@/services/addressService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, ArrowRight, AlertCircle, Copy, Check, MapPin, Navigation } from 'lucide-react';
import { shipmentService, CreateShipmentResponse } from '@/services/shipmentService';

export function CreateShipment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  
  // Address & Geocoding State
  const [pickupAddressText, setPickupAddressText] = useState('');
  const [pickupAddressDto, setPickupAddressDto] = useState<AddressDto | null>(null);
  const [deliveryAddressText, setDeliveryAddressText] = useState('');
  const [deliveryAddressDto, setDeliveryAddressDto] = useState<AddressDto | null>(null);

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

    if (!pickupAddressText.trim() || !deliveryAddressText.trim()) {
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
        pickupAddress: pickupAddressText.trim(),
        deliveryAddress: deliveryAddressText.trim(),
        originAddress: pickupAddressDto || undefined,
        destinationAddress: deliveryAddressDto || undefined,
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
    setPickupAddressText('');
    setPickupAddressDto(null);
    setDeliveryAddressText('');
    setDeliveryAddressDto(null);
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
                Your delivery request has been booked with geocoded route coordinates.
              </p>
            </div>

            <div className="bg-navy-50/70 p-4 rounded-xl border border-navy-100 flex items-center justify-between max-w-md mx-auto">
              <div className="text-left">
                <p className="text-xs text-navy-500 font-semibold uppercase">Tracking Number</p>
                <p className="font-mono text-xl font-bold text-primary-600 tracking-wider">
                  {createdResult.trackingNumber}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={copyTracking} className="h-9">
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1.5">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="primary"
                onClick={() => navigate(`/tracking/${createdResult.trackingNumber}`)}
                className="font-bold"
              >
                <Navigation className="h-4 w-4 mr-2" /> Live Track Route
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/shipments/${createdResult.id}`)}
              >
                View Shipment Details
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Create New Shipment</h1>
          <p className="text-sm text-navy-500 mt-1">
            Book a parcel pickup with automatic OpenStreetMap address geocoding.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender & Pickup Details */}
          <Card className="border-navy-200">
            <CardHeader className="bg-navy-50/50 border-b border-navy-100">
              <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary-600" /> 1. Origin / Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                  Sender Name *
                </label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Full name or company"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                  Sender Phone *
                </label>
                <Input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              {/* Autocomplete Pickup Input */}
              <AddressAutocompleteInput
                label="Pickup Address (Origin)"
                placeholder="Search pickup hub, landmark, or street..."
                value={pickupAddressText}
                onChange={setPickupAddressText}
                onAddressSelect={setPickupAddressDto}
                selectedAddress={pickupAddressDto}
                required
              />
            </CardContent>
          </Card>

          {/* Receiver & Delivery Details */}
          <Card className="border-navy-200">
            <CardHeader className="bg-navy-50/50 border-b border-navy-100">
              <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" /> 2. Destination / Receiver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                  Receiver Name *
                </label>
                <Input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Full recipient name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                  Receiver Phone *
                </label>
                <Input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="+91 98765 43211"
                  required
                />
              </div>

              {/* Autocomplete Delivery Input */}
              <AddressAutocompleteInput
                label="Delivery Address (Destination)"
                placeholder="Search delivery locality, city, or pincode..."
                value={deliveryAddressText}
                onChange={setDeliveryAddressText}
                onAddressSelect={setDeliveryAddressDto}
                selectedAddress={deliveryAddressDto}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Package Specs */}
        <Card className="border-navy-200">
          <CardHeader className="bg-navy-50/50 border-b border-navy-100">
            <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-600" /> 3. Package Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                Weight (kg) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="1.0"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                Contents Description
              </label>
              <Input
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="e.g. Fragile Electronics, Documents, Clothing"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-8 font-bold"
            isLoading={isSubmitting}
          >
            Book Shipment <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
