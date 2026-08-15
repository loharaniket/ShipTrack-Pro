import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await authService.login(email, password);
      login(user);
      navigate('/');
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-navy-900 text-center mb-1">Sign in to your account</h3>
        <p className="text-xs text-navy-500 text-center">
          Test different dashboards using these emails (any password):<br/>
          <span className="font-medium text-primary-600">admin@</span>, <span className="font-medium text-primary-600">business@</span>, <span className="font-medium text-primary-600">driver@</span>, <span className="font-medium text-primary-600">customer@</span>
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          label="Email address" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@shiptrack.pro"
        />
        <div>
          <Input 
            label="Password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-navy-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-navy-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-navy-500">Don't have an account? </span>
        <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </Link>
      </div>
    </div>
  );
}
