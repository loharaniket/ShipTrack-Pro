import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { user } = await authService.login(email, password);
      login(user);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-navy-900 text-center mb-1">Sign in to ShipTrack Pro</h3>
        <p className="text-xs text-navy-500 text-center">
          Enter your credentials to access your portal
        </p>
      </div>

      {justRegistered && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Account created successfully! Please sign in below.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          label="Email address" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
        <div>
          <Input 
            label="Password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-navy-500">Don't have an account? </span>
        <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
          Create customer account
        </Link>
      </div>
    </div>
  );
}
