import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Save, User } from 'lucide-react';

const ProfileSettings = () => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/users', formData);
      setSuccess('Profile updated successfully!');
      // A full app might want to re-fetch the profile in context here,
      // but since we only update names, the next refresh will pick it up,
      // or we could explicitly call fetchProfile if we exported it from AuthContext.
      // For now, reloading the page ensures everything syncs.
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your personal information.</p>
      </div>

      <div className="glass p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b pb-4 border-gray-100 dark:border-gray-800">
          <div className="h-16 w-16 bg-[var(--color-brand)]/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-[var(--color-brand)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{currentUser?.firstName} {currentUser?.lastName}</h2>
            <p className="text-gray-500">{currentUser?.email}</p>
            <p className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md inline-block mt-2 uppercase tracking-wide">
              {currentUser?.role}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] rounded-md text-sm">{error}</div>}
          {success && <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-sm">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Last Name" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-500">Email Address (Cannot be changed)</label>
              <input 
                type="email" 
                value={currentUser?.email || ''} 
                disabled 
                className="px-3 py-2 border rounded-md shadow-sm bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed" 
              />
            </div>
            
            {currentUser?.companyName && (
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-500">Company</label>
                <input 
                  type="text" 
                  value={currentUser.companyName} 
                  disabled 
                  className="px-3 py-2 border rounded-md shadow-sm bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed" 
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="submit" className="gap-2" disabled={loading || !formData.firstName || !formData.lastName}>
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
