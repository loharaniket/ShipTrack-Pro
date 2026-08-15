import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';

export function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      const { user } = await authService.register({
        firstName,
        lastName,
        email,
        password,
        phone
      });
      login(user);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-navy-900 text-center mb-1">Create an account</h3>
        <p className="text-sm text-navy-500 text-center">
          Sign up as a new customer
        </p>
      </div>
      
      {errorMsg && (
        <div className="bg-danger-50 text-danger-600 p-3 rounded-md text-sm text-center">
          {errorMsg}
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="First name" 
            type="text" 
            required 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input 
            label="Last name" 
            type="text" 
            required 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        
        <Input 
          label="Email address" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Input 
          label="Phone number (optional)" 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        
        <Input 
          label="Password" 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Input 
          label="Confirm Password" 
          type="password" 
          required 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          Register
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-navy-500">Already have an account? </span>
        <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </div>
    </div>
  );
}
