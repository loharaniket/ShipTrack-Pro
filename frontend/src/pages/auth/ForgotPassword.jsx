import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-[var(--color-brand)]" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
              Check your email for the reset link!
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input 
              id="email" 
              type="email" 
              label="Email address" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />

            {error && <p className="text-sm text-[var(--color-status-error)] text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[var(--color-brand)]">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
