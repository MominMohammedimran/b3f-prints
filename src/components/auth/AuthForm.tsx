
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import VerificationForm from './VerificationForm';

// Form schemas
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  initialMode: 'signin' | 'signup';
  redirectTo?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'signin', redirectTo = '/' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  // Sign in form
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Sign up form
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });
  
  const handleSignIn = async (values: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message || 'Failed to sign in');
        setIsSubmitting(false);
        return;
      }
      
      toast.success('Signed in successfully');
      navigate(redirectTo || '/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      setIsSubmitting(false);
    }
  };
  
  const handleSignUp = async (values: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      // Store user data for verification step
      setUserData({
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setUserEmail(values.email);
      setUserPassword(values.password);
      
      // Attempt to sign up (this will be handled by the verification step)
      const { error } = await signUp(values.email, values.password);
      
      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message || 'Failed to sign up');
        setIsSubmitting(false);
        return;
      }
      
      // Switch to verification mode
      setMode('verify');
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      setIsSubmitting(false);
    }
  };
  
  const handleBackToSignUp = () => {
    setMode('signup');
  };
  
  if (mode === 'verify') {
    return (
      <VerificationForm 
        userEmail={userEmail}
        userPassword={userPassword}
        userData={userData}
        onBack={handleBackToSignUp}
      />
    );
  }
  
  return (
    <div>
      {mode === 'signin' ? (
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <div className="text-center">
              <Button 
                variant="link" 
                type="button"
                onClick={() => navigate('/reset-password')}
              >
                Forgot Password?
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...signUpForm}>
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={signUpForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signUpForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={signUpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing Up...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};
