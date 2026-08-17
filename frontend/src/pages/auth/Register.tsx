import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { AlertCircle } from 'lucide-react';

export function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined
      });
      navigate('/auth/login?registered=true');
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please check your information and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-navy-900 text-center mb-1">Create Customer Account</h3>
        <p className="text-xs text-navy-500 text-center">
          Sign up to create and track your shipments
        </p>
      </div>
      
      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
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
            placeholder="Rahul"
          />
          <Input 
            label="Last name" 
            type="text" 
            required 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Patil"
          />
        </div>
        
        <Input 
          label="Email address" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="rahul.patil@example.com"
        />
        
        <Input 
          label="Phone number (optional)" 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
        />
        
        <Input 
          label="Password" 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        
        <Input 
          label="Confirm Password" 
          type="password" 
          required 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
        />

        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          Create Account
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
