import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Check } from 'lucide-react';
import { organizationApi, OrganizationResponse } from '@/services/api/organizationApi';

export function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [org, setOrg] = useState<OrganizationResponse | null>(null);

  // Form State
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const data = await organizationApi.getCurrent();
        setOrg(data);
        setOrgName(data.name || '');
        setOrgEmail(data.email || '');
      } catch (err) {
        console.error('Failed to fetch organization settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleSave = async () => {
    if (!org) return;
    setIsSaving(true);
    try {
      await organizationApi.update(org.id, {
        name: orgName,
        email: orgEmail,
        // Send existing unmodified fields so they aren't erased if backend requires full patch or we want to be safe
        phone: org.phone,
        addressLine1: org.addressLine1,
        addressLine2: org.addressLine2,
        city: org.city,
        state: org.state,
        postalCode: org.postalCode,
        country: org.country
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update organization', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-navy-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">System Settings</h1>
          <p className="text-navy-500 mt-1">Configure global platform behavior and integrations</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isSaved}>
          {isSaving ? 'Saving...' : isSaved ? <><Check className="h-4 w-4 mr-2"/> Saved</> : <><Save className="h-4 w-4 mr-2"/> Save Changes</>}
        </Button>
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
                <Input 
                  label="Organization Name" 
                  value={orgName} 
                  onChange={(e) => setOrgName(e.target.value)} 
                />
                <Input 
                  label="Support Email" 
                  value={orgEmail} 
                  onChange={(e) => setOrgEmail(e.target.value)} 
                />
                
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
