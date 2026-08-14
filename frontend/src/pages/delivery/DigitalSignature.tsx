import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eraser, CheckCircle, UploadCloud, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DigitalSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [isSigned, setIsSigned] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [notes, setNotes] = useState('');

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
    }
  };

  const handleDraw = () => {
    setIsSigned(true);
  };

  const handleSubmit = () => {
    // In a real app, this would upload the POD data
    alert('POD Captured successfully!');
    navigate('/my-route');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Proof of Delivery</h1>
          <p className="text-navy-500 mt-1">Complete delivery for Shipment SHP-10025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle className="text-lg">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-navy-500 mb-1">Customer</p>
                <p className="font-bold text-navy-900">ABC Retail</p>
              </div>
              <div>
                <p className="text-navy-500 mb-1">Delivery Address</p>
                <p className="font-medium text-navy-900">
                  Pune Business Park,<br />
                  Hinjewadi Phase 1,<br />
                  Pune, Maharashtra 411057
                </p>
              </div>
              <div>
                <p className="text-navy-500 mb-1">Contact</p>
                <p className="font-medium text-navy-900">+91 98765 43210</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle className="text-lg">Receiver Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Receiver Name</label>
                <Input 
                  placeholder="Enter the name of the person receiving the package"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Signature</label>
                <div className="border-2 border-dashed border-navy-300 rounded-lg overflow-hidden bg-navy-50 relative">
                  <canvas 
                    ref={canvasRef}
                    width={800}
                    height={200}
                    className="w-full h-[200px] cursor-crosshair touch-none"
                    onMouseDown={handleDraw}
                    onTouchStart={handleDraw}
                  />
                  {!isSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-navy-300 font-medium">Draw signature here</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={clearSignature} className="text-navy-500 hover:text-navy-700">
                    <Eraser className="h-4 w-4 mr-2" /> Clear Signature
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Photo Evidence</label>
                  <div className="border-2 border-dashed border-navy-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-navy-50 transition-colors cursor-pointer">
                    <Camera className="h-8 w-8 text-navy-400 mb-2" />
                    <span className="text-sm font-medium text-primary-600">Click to upload photo</span>
                    <span className="text-xs text-navy-500 mt-1">Optional, max 5MB</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Notes (Optional)</label>
                  <textarea 
                    className="w-full h-[120px] rounded-md border border-navy-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Any additional delivery notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-navy-100 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button 
                  className="bg-success-600 hover:bg-success-700 text-white" 
                  disabled={!isSigned || !receiverName.trim()}
                  onClick={handleSubmit}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Confirm Delivery
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
