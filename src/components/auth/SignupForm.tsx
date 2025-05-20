
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface SignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  setMode: (mode: 'signin' | 'signup' | 'otp') => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  togglePasswordVisibility,
  handleSubmit,
  loading,
  setMode
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        {password && (
          <PasswordStrengthIndicator password={password} />
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMode('signin');
            }}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
