import React, { useState } from 'react';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Building2, Plus } from 'lucide-react';

const CompanyManagement = () => {
  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    email: '',
    phone: '',
    website: '',
    // Primary User Details
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    userPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Create the Company
      const companyRes = await api.post('/companies', {
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website
      });
      
      const newCompanyId = companyRes.data.data.id;

      // 2. Create the Primary Business Client User assigned to the new company
      await api.post('/admin', {
        firstName: formData.userFirstName,
        lastName: formData.userLastName,
        email: formData.userEmail,
        password: formData.userPassword,
        role: 'BUSINESS_CLIENT',
        isActive: true,
        companyId: newCompanyId
      });

      setSuccess('Company and Primary User successfully registered!');
      setFormData({ 
        companyName: '', email: '', phone: '', website: '',
        userFirstName: '', userLastName: '', userEmail: '', userPassword: '' 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Process failed. Please verify the input or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Register Business Client</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Onboard a new company to the ShipTrack platform.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl shadow-sm space-y-8">
        {error && <div className="p-4 bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] rounded-md text-sm">{error}</div>}
        {success && <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-sm">{success}</div>}
        
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">1. Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Company Name" 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleChange} 
              required 
              placeholder="Acme Corp" 
              className="md:col-span-2"
            />
            <Input 
              label="Company Email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="contact@acmecorp.com" 
            />
            <Input 
              label="Company Phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              placeholder="+1 234 567 890"
            />
            <Input 
              label="Website" 
              name="website" 
              value={formData.website} 
              onChange={handleChange} 
              placeholder="www.acmecorp.com"
              className="md:col-span-2"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">2. Primary Administrator (Business Client)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              name="userFirstName" 
              value={formData.userFirstName} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Last Name" 
              name="userLastName" 
              value={formData.userLastName} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="User Email (Login ID)" 
              name="userEmail" 
              type="email" 
              value={formData.userEmail} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Temporary Password" 
              name="userPassword" 
              type="password"
              value={formData.userPassword} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="submit" className="gap-2" disabled={loading}>
            <Building2 className="h-4 w-4" />
            {loading ? 'Processing...' : 'Register Company & User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyManagement;
