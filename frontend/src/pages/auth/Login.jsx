import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PackageSearch } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check credentials.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-[var(--color-brand)]" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]">
              register a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shiptrack.com"
            />
            <div className="space-y-2">
              <Input 
                id="password" 
                type="password" 
                label="Password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-[var(--color-status-error)] text-center">{error}</p>}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
