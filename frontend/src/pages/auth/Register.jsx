import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    website: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 my-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]">
              Sign in here
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input id="firstName" label="First Name" required value={formData.firstName} onChange={handleChange} />
            <Input id="lastName" label="Last Name" required value={formData.lastName} onChange={handleChange} />
          </div>
          <Input id="email" type="email" label="Email address" required value={formData.email} onChange={handleChange} />
          <Input id="password" type="password" label="Password" required value={formData.password} onChange={handleChange} />
          
          <Input id="phone" type="tel" label="Phone Number (Optional)" value={formData.phone} onChange={handleChange} />
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Business Details (Optional)</h3>
            <div className="space-y-4">
              <Input id="companyName" label="Company Name" value={formData.companyName} onChange={handleChange} />
              <Input id="website" type="url" label="Website URL" value={formData.website} onChange={handleChange} />
            </div>
          </div>

          {error && <p className="text-sm text-[var(--color-status-error)] text-center">{error}</p>}

          <Button type="submit" className="w-full">
            Register Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;

