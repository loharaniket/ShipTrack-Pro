import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Bell, Key } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Profile Management</h1>
          <p className="text-navy-500 mt-1">Manage your personal information and security settings</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <button className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium bg-navy-100 text-navy-900">
            <User className="h-4 w-4 mr-2" /> Personal Info
          </button>
          <button className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy-900">
            <Shield className="h-4 w-4 mr-2" /> Security & Password
          </button>
          <button className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy-900">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </button>
          <button className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy-900">
            <Key className="h-4 w-4 mr-2" /> Connected Devices
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={user?.name || ''} />
                <Input label="Email Address" type="email" defaultValue={user?.email || ''} readOnly className="bg-navy-50" />
                <Input label="Phone Number" defaultValue="+1 (555) 123-4567" />
                <Input label="Role" defaultValue={user?.role || ''} readOnly className="bg-navy-50" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="outline" className="mr-2">Cancel</Button>
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
