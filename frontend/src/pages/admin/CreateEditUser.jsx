import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';

const CreateEditUser = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    isActive: true,
    licenseNumber: '',
    experienceYears: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/admin/${id}`);
      const user = response.data.data;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // Don't populate password
        role: user.role || 'CUSTOMER',
        isActive: user.isActive !== false,
      });
    } catch (err) {
      setError('Failed to fetch user details');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };

      if (isEditing) {
        // Don't send password if it's empty during edit
        if (!payload.password) delete payload.password;
        await api.put(`/admin/${id}`, payload);
      } else {
        await api.post('/admin', payload);
      }
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user.`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit User' : 'Create User'}</h1>
          <p className="text-gray-500 dark:text-gray-400">{isEditing ? 'Update user details and permissions.' : 'Add a new user to the system.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl shadow-sm space-y-6">
        {error && <div className="p-4 bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] rounded-md text-sm">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
          <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isEditing} />
          
          <Input 
            label={isEditing ? "New Password (Optional)" : "Password"} 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            required={!isEditing} 
          />

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="px-3 py-2 border rounded-md shadow-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-800">
              <option value="CUSTOMER">Customer</option>
              <option value="BUSINESS_CLIENT">Business Client</option>
              <option value="LOGISTICS_OPERATOR">Logistics Operator</option>
              <option value="SUPPORT_AGENT">Support Agent</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>

          {formData.role === 'LOGISTICS_OPERATOR' && !isEditing && (
            <>
              <Input label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required />
              <Input label="Years of Experience" name="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={handleChange} required />
            </>
          )}

          <div className="flex items-center space-x-2 pt-6">
            <input 
              type="checkbox" 
              id="isActive" 
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-[var(--color-brand)] focus:ring-[var(--color-brand)] border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Account
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/users')}>Cancel</Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditUser;
