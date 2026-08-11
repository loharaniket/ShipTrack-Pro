import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eraser, CheckCircle } from 'lucide-react';

export function DigitalSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigned, setIsSigned] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Capture Signature</h1>
          <p className="text-navy-500 mt-1">Please sign below to confirm delivery</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign Here</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-navy-300 rounded-lg overflow-hidden bg-navy-50 relative">
            <canvas 
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full h-[300px] cursor-crosshair touch-none"
              onMouseDown={handleDraw}
              onTouchStart={handleDraw}
            />
            {!isSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-navy-300 font-medium">Draw signature here</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-navy-100">
            <Button variant="outline" onClick={clearSignature}>
              <Eraser className="h-4 w-4 mr-2" /> Clear
            </Button>
            <Button disabled={!isSigned} className="bg-success-600 hover:bg-success-700 text-white border-0">
              <CheckCircle className="h-4 w-4 mr-2" /> Submit Signature
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
