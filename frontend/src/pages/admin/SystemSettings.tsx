import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';

export function SystemSettings() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">System Settings</h1>
          <p className="text-navy-500 mt-1">Configure global platform behavior and integrations</p>
        </div>
        <Button><Save className="h-4 w-4 mr-2"/> Save Changes</Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="space-y-1">
          {['General', 'Shipments', 'Notifications', 'Tracking', 'Security', 'Integrations', 'API & Webhooks'].map(tab => (
            <button key={tab} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${tab === 'General' ? 'bg-navy-100 text-navy-900' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Organization Name" defaultValue="Acme Logistics Corp" />
                <Input label="Support Email" defaultValue="support@acme-logistics.com" />
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Time Zone</label>
                  <select className="w-full border border-navy-300 rounded p-2 text-sm bg-white">
                    <option>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Currency</label>
                  <select className="w-full border border-navy-300 rounded p-2 text-sm bg-white">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-navy-200 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900">Enforce Multi-Factor Authentication (MFA)</p>
                  <p className="text-sm text-navy-500">Require all users to configure MFA</p>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded text-primary-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border border-navy-200 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900">Session Timeout</p>
                  <p className="text-sm text-navy-500">Automatically log out inactive users</p>
                </div>
                <select className="border border-navy-300 rounded px-2 py-1 text-sm bg-white">
                  <option>30 Minutes</option>
                  <option>1 Hour</option>
                  <option>4 Hours</option>
                  <option>12 Hours</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
