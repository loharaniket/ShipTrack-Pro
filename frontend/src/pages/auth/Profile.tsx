import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Bell, Key, Loader2 } from 'lucide-react';
import { userApi } from '@/services/api/userApi';
import { organizationApi, OrganizationResponse } from '@/services/api/organizationApi';

export function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Personal Info');
  
  // Profile State
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: ''
  });

  // Organization State
  const [orgLoading, setOrgLoading] = useState(true);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [orgMsg, setOrgMsg] = useState({ type: '', text: '' });
  const [orgData, setOrgData] = useState<OrganizationResponse | null>(null);
  const [orgForm, setOrgForm] = useState({
    name: '', email: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: ''
  });

  // Password State
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data: any = await userApi.getById(user.id);
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          email: data.email || '',
          role: (data.roles && data.roles.length > 0) ? data.roles[0] : 'CUSTOMER'
        });
      } catch (err) {
        console.error('Failed to load profile details', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrganization = async () => {
      try {
        setOrgLoading(true);
        const data = await organizationApi.getCurrent();
        setOrgData(data);
        setOrgForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          country: data.country || ''
        });
      } catch (err) {
        console.error('Failed to load organization details', err);
      } finally {
        setOrgLoading(false);
      }
    };

    fetchProfile();
    if (user?.role === 'BusinessClient' || user?.role === 'Administrator') {
      fetchOrganization();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsSavingProfile(true);
      setProfileMsg({ type: '', text: '' });
      
      await userApi.update(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone
      });
      
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.id) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill out all password fields' });
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordMsg({ type: '', text: '' });
      
      await userApi.changePassword(user.id, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!orgData?.id) return;
    
    try {
      setIsSavingOrg(true);
      setOrgMsg({ type: '', text: '' });
      
      await organizationApi.update(orgData.id, orgForm);
      
      setOrgMsg({ type: 'success', text: 'Organization updated successfully!' });
      setTimeout(() => setOrgMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setOrgMsg({ type: 'error', text: err.message || 'Failed to update organization' });
    } finally {
      setIsSavingOrg(false);
    }
  };

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
          <button 
            onClick={() => setActiveTab('Personal Info')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'Personal Info' ? 'bg-navy-100 text-navy-900' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'}`}
          >
            <User className="h-4 w-4 mr-2" /> Personal Info
          </button>
          
          {(user?.role === 'BusinessClient' || user?.role === 'Administrator') && (
            <button 
              onClick={() => setActiveTab('Organization Info')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'Organization Info' ? 'bg-navy-100 text-navy-900' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'}`}
            >
              <Shield className="h-4 w-4 mr-2" /> Organization Profile
            </button>
          )}

          <button 
            onClick={() => setActiveTab('Security & Password')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'Security & Password' ? 'bg-navy-100 text-navy-900' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'}`}
          >
            <Key className="h-4 w-4 mr-2" /> Security & Password
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'Personal Info' && (
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
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <>
                  {profileMsg.text && (
                    <div className={`p-3 rounded-md mb-4 ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {profileMsg.text}
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input 
                      label="First Name" 
                      value={profileData.firstName} 
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    />
                    <Input 
                      label="Last Name" 
                      value={profileData.lastName} 
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    />
                    <Input 
                      label="Email Address" 
                      type="email" 
                      value={profileData.email} 
                      readOnly 
                      className="bg-navy-50" 
                    />
                    <Input 
                      label="Phone Number" 
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                    <Input 
                      label="Role" 
                      value={profileData.role} 
                      readOnly 
                      className="bg-navy-50" 
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}

          {activeTab === 'Organization Info' && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orgLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <>
                  {orgMsg.text && (
                    <div className={`p-3 rounded-md mb-4 ${orgMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {orgMsg.text}
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input 
                      label="Organization Name" 
                      value={orgForm.name} 
                      onChange={(e) => setOrgForm({...orgForm, name: e.target.value})}
                    />
                    <Input 
                      label="Organization Code" 
                      value={orgData?.code || ''} 
                      readOnly 
                      className="bg-navy-50" 
                    />
                    <Input 
                      label="Business Email" 
                      type="email"
                      value={orgForm.email} 
                      onChange={(e) => setOrgForm({...orgForm, email: e.target.value})}
                    />
                    <Input 
                      label="Business Phone" 
                      value={orgForm.phone} 
                      onChange={(e) => setOrgForm({...orgForm, phone: e.target.value})}
                    />
                    <Input 
                      label="Address Line 1" 
                      value={orgForm.addressLine1} 
                      onChange={(e) => setOrgForm({...orgForm, addressLine1: e.target.value})}
                    />
                    <Input 
                      label="Address Line 2" 
                      value={orgForm.addressLine2} 
                      onChange={(e) => setOrgForm({...orgForm, addressLine2: e.target.value})}
                    />
                    <Input 
                      label="City" 
                      value={orgForm.city} 
                      onChange={(e) => setOrgForm({...orgForm, city: e.target.value})}
                    />
                    <Input 
                      label="State/Province" 
                      value={orgForm.state} 
                      onChange={(e) => setOrgForm({...orgForm, state: e.target.value})}
                    />
                    <Input 
                      label="Postal Code" 
                      value={orgForm.postalCode} 
                      onChange={(e) => setOrgForm({...orgForm, postalCode: e.target.value})}
                    />
                    <Input 
                      label="Country" 
                      value={orgForm.country} 
                      onChange={(e) => setOrgForm({...orgForm, country: e.target.value})}
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveOrganization} disabled={isSavingOrg || !orgForm.name}>
                      {isSavingOrg ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {isSavingOrg ? 'Saving...' : 'Save Organization'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}

          {activeTab === 'Security & Password' && (
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMsg.text && (
                <div className={`p-3 rounded-md mb-4 ${passwordMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {passwordMsg.text}
                </div>
              )}
              
              <div className="max-w-md space-y-4">
                <Input 
                  label="Current Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  disabled={isSavingPassword}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePassword} disabled={isSavingPassword}>
                  {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

        </div>
      </div>
    </div>
  );
}
