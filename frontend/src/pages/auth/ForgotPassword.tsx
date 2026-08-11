import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium text-navy-900">Check your email</h3>
        <p className="text-sm text-navy-600">
          We've sent password reset instructions to {email}
        </p>
        <Button onClick={() => navigate('/auth/login')} className="w-full">
          Return to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-navy-900">Forgot your password?</h3>
        <p className="text-sm text-navy-500 mt-1">Enter your email and we'll send you a reset link.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          label="Email address" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <div className="text-center text-sm">
        <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
          Back to login
        </Link>
      </div>
    </div>
  );
}
