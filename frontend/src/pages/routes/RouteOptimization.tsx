import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, ArrowRight } from 'lucide-react';

export function RouteOptimization() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Route Optimization</h1>
          <p className="text-navy-500 mt-1">AI-powered route sequencing and assignment</p>
        </div>
        <Button>Apply Optimization</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-navy-200">
          <CardHeader className="bg-navy-50 border-b border-navy-200">
            <CardTitle>Current Route</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-navy-500">Distance</p>
                <p className="text-xl font-semibold text-navy-900">185 km</p>
              </div>
              <div>
                <p className="text-sm text-navy-500">Time</p>
                <p className="text-xl font-semibold text-navy-900">4h 20m</p>
              </div>
              <div>
                <p className="text-sm text-navy-500">Stops</p>
                <p className="text-xl font-semibold text-navy-900">8</p>
              </div>
            </div>
            
            <div className="h-64 bg-navy-100 rounded flex items-center justify-center border border-navy-200">
              <span className="text-navy-400">Original Map View</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
          <CardHeader className="bg-indigo-50/30 border-b border-indigo-100">
            <CardTitle className="text-indigo-900 flex items-center">
              Optimized Route <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">Recommended</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center relative">
              <div>
                <p className="text-sm text-navy-500">Distance</p>
                <div className="flex items-center justify-center text-xl font-semibold text-success-600">
                  142 km
                </div>
                <p className="text-xs text-success-500 mt-1">-43 km</p>
              </div>
              <div>
                <p className="text-sm text-navy-500">Time</p>
                <div className="flex items-center justify-center text-xl font-semibold text-success-600">
                  3h 45m
                </div>
                <p className="text-xs text-success-500 mt-1">-35 min</p>
              </div>
              <div>
                <p className="text-sm text-navy-500">Stops</p>
                <p className="text-xl font-semibold text-navy-900">8</p>
              </div>
            </div>

            <div className="h-64 bg-navy-100 rounded flex items-center justify-center border border-navy-200">
              <span className="text-indigo-500 font-medium">Optimized Map View</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between bg-success-50">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center text-success-600 mr-4">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-success-900">Optimization Successful</h3>
              <p className="text-sm text-success-700 mt-1">Applying this route will save an estimated 43km and 35 minutes of driving time.</p>
            </div>
          </div>
          <Button className="bg-success-600 hover:bg-success-700 text-white border-0">
            Save & Assign <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
