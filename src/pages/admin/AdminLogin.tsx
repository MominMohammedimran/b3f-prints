
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminOTPForm from '@/components/admin/AdminOTPForm';
import { User } from '@supabase/supabase-js';

// Define proper interface for admin records
interface AdminRecord {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  user_id?: string;
  permissions?: string[];
}

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [usePasswordLogin, setUsePasswordLogin] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is already logged in as admin
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.info('Checking admin status for', session.user.email);
        
        // Check if user is in admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();
          
        if (adminError) {
          console.error('Error fetching admin data:', adminError);
          return;
        }
        
        if (adminData) {
          // User is an admin, redirect to admin dashboard
          setUser(session.user);
          navigate('/admin/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // For the specific admin email, use direct admin check first
      if (email === 'b3fprintingsolutions@gmail.com') {
        // Check if email exists in admin_users table regardless of auth
        const { data: adminCheck, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError);
        }
        
        // If admin exists in table, proceed with normal auth
        if (!adminCheck) {
          console.log('Creating admin account for', email);
          // Insert admin record if it doesn't exist
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email: email,
              role: 'super_admin',
              permissions: ['products.all', 'orders.all', 'users.all']
            });
            
          if (insertError) {
            console.error('Error creating admin account:', insertError);
          }
        }
      }
      
      // Sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (!data.user) {
        throw new Error('No user returned after login');
      }
      
      // Check if this user is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (adminError) {
        console.error('Error verifying admin status:', adminError);
        throw new Error('Error verifying admin status: ' + adminError.message);
      }
      
      if (adminData) {
        // Cast to proper type
        const admin = adminData as AdminRecord;
        
        // Update user_id if not set - use a separate variable for the update
        if (data.user.id && !admin.user_id) {
          // Execute an SQL query that will work with our database schema
          const { error: updateError } = await supabase
            .from('admin_users')
            .update({ 
              // Note: Only include fields that actually exist in the table
              updated_at: new Date().toISOString()
            })
            .eq('id', admin.id);
            
          if (updateError) {
            console.error('Error updating admin record:', updateError);
          }
          
          // Store the user_id in the admin object for local use
          admin.user_id = data.user.id;
        }
        
        // Successfully authenticated as admin
        toast.success('Login successful!');
        
        // Store admin role in localStorage
        localStorage.setItem('adminRole', admin.role || 'admin');
        localStorage.setItem('adminId', admin.user_id || data.user.id);
        localStorage.setItem('adminPermissions', JSON.stringify(admin.permissions || []));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // If user authenticated but not in admin table, add them for our designated admin
        if (email === 'b3fprintingsolutions@gmail.com') {
          const { data: insertData, error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email: email,
              // Note: Only include fields that exist in the table based on the database schema
            });
            
          if (insertError) {
            throw new Error('Error creating admin account: ' + insertError.message);
          }
          
          toast.success('Admin account created and login successful!');
          
          // Store admin role in localStorage
          localStorage.setItem('adminRole', 'super_admin');
          localStorage.setItem('adminId', data.user.id);
          localStorage.setItem('adminPermissions', JSON.stringify(['products.all', 'orders.all', 'users.all']));
          
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
          return;
        }
        
        // User exists but is not an admin
        await supabase.auth.signOut();
        throw new Error('User is not authorized as admin');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid login credentials');
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if the email is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (adminError) {
        throw new Error('Error verifying admin status');
      }
      
      if (!adminData) {
        throw new Error('User is not authorized as admin');
      }
      
      // Send OTP for verification
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
      });
      
      if (otpError) {
        throw otpError;
      }
      
      // Log for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode: OTP sent to ${email}. Use code: 123456`);
      }
      
      toast.success('Verification code sent to your email');
      setIsOtpMode(true);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In development mode, accept 123456 as a valid OTP
      let verificationResult;
      
      if (process.env.NODE_ENV === 'development' && otp === '123456') {
        console.log('Development mode: Using test OTP');
        // For development, we'll simulate a successful verification
        // We'll sign in with a special method
        verificationResult = await supabase.auth.signInWithPassword({
          email,
          password: 'development-mode-password', // This won't actually be used
        });
        
        // Override the error property for development mode
        if (verificationResult.error) {
          // In dev mode, override the error and proceed with admin check
          console.log('Development mode: Ignoring auth error and proceeding with admin check');
          verificationResult.error = null;
        }
      } else {
        // Normal verification flow
        verificationResult = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email'
        });
      }
      
      if (verificationResult.error) {
        throw verificationResult.error;
      }
      
      // Now check if this user is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (adminError) {
        throw new Error('Error verifying admin status');
      }
      
      if (adminData) {
        // Cast to proper type
        const admin = adminData as AdminRecord;
        
        // Successfully authenticated as admin
        toast.success('Verification successful!');
        
        // Store admin role in localStorage
        localStorage.setItem('adminRole', admin.role || 'admin');
        localStorage.setItem('adminId', admin.user_id || admin.id);
        localStorage.setItem('adminPermissions', JSON.stringify(admin.permissions || []));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // User authenticated but is not an admin
        if (verificationResult.data.user) {
          await supabase.auth.signOut();
        }
        throw new Error('User is not authorized as admin');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {isOtpMode ? (
            <AdminOTPForm
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleSendOTP}
              onBack={() => setIsOtpMode(false)}
            />
          ) : (
            <AdminLoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
              usePasswordLogin={usePasswordLogin}
              setUsePasswordLogin={setUsePasswordLogin}
              handleLogin={handleLogin}
              handleSendOTP={handleSendOTP}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
