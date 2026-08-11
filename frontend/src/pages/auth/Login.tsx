import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Determine role based on email prefix for demo purposes
    let role: 'Customer' | 'BusinessClient' | 'LogisticsOperator' | 'SupportAgent' | 'Administrator' = 'Customer';
    let name = 'Demo User';
    
    if (email.includes('admin')) { role = 'Administrator'; name = 'Admin User'; }
    else if (email.includes('business')) { role = 'BusinessClient'; name = 'Business User'; }
    else if (email.includes('operator')) { role = 'LogisticsOperator'; name = 'Logistics Operator'; }
    else if (email.includes('support')) { role = 'SupportAgent'; name = 'Support Agent'; }
    else if (email.includes('customer')) { role = 'Customer'; name = 'Customer User'; }

    // Simulate API call
    setTimeout(() => {
      login({
        id: 'usr-1',
        name,
        email,
        role
      });
      navigate('/');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-navy-900 text-center mb-1">Sign in to your account</h3>
        <p className="text-xs text-navy-500 text-center">
          Test different dashboards using these emails (any password):<br/>
          <span className="font-medium text-primary-600">admin@</span>, <span className="font-medium text-primary-600">business@</span>, <span className="font-medium text-primary-600">operator@</span>, <span className="font-medium text-primary-600">support@</span>, <span className="font-medium text-primary-600">customer@</span>
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
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-navy-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-navy-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">Google</Button>
          <Button variant="outline" className="w-full">Enterprise SSO</Button>
        </div>
      </div>
    </div>
  );
}
