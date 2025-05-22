
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminOTPForm from '@/components/admin/AdminOTPForm';
import { User } from '@supabase/supabase-js';
import { ensureMainAdminExists, DEFAULT_ADMIN_PERMISSIONS } from '@/utils/adminAuth';

// Define proper interface for admin records with all required fields
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
  const [usePasswordLogin, setUsePasswordLogin] = useState(false); // Default to OTP
  const [isOtpMode, setIsOtpMode] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is already logged in as admin
  useEffect(() => {
    checkAdminStatus();
    
    // Try to ensure our main admin exists
    ensureMainAdminExists().catch(err => 
      console.error('Failed to ensure main admin exists:', err)
    );
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
      const isTargetEmail = email === 'b3fprintingsolutions@gmail.com';
      
      // For the specific admin email, use direct admin check first
      if (isTargetEmail) {
        // Check if email exists in admin_users table regardless of auth
        const { data: adminCheck, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', 'b3fprintingsolutions@gmail.com')
          .maybeSingle();
        
        if (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError);
        }
        
        // If admin doesn't exist in table, create it
        if (!adminCheck) {
          console.log('Creating admin account for', email);
          // Insert admin record if it doesn't exist
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email: email,
              role: 'super_admin',
              permissions: ['products.all', 'orders.all', 'users.all']
            } as any);
            
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
      
      const userEmail = data.user.email || '';
      const isB3FEmail = userEmail === 'b3fprintingsolutions@gmail.com';
      
      // Check if this user is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();
      
      if (adminError) {
        console.error('Error verifying admin status:', adminError);
        throw new Error('Error verifying admin status: ' + adminError.message);
      }
      
      if (adminData) {
        // Cast to proper type
        const admin = adminData as AdminRecord;
        
        // Store admin role in localStorage
        localStorage.setItem('adminRole', admin.role || 'admin');
        localStorage.setItem('adminId', admin.id);
        localStorage.setItem('adminPermissions', JSON.stringify(admin.permissions || DEFAULT_ADMIN_PERMISSIONS));
        
        // Successfully authenticated as admin
        toast.success('Login successful!');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // If user authenticated but not in admin table, add them for our designated admin
        if (isB3FEmail) {
          const { data: insertData, error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email: data.user.email,
              role: 'super_admin',
              permissions: ['products.all', 'orders.all', 'users.all'],
              // We need to explicitly cast the object to include user_id
              user_id: data.user.id
            } as any) // Using type assertion to bypass TypeScript error
            .select()
            .single();
            
          if (insertError) {
            throw new Error('Error creating admin account: ' + insertError.message);
          }
          
          if (insertData) {
            toast.success('Admin account created and login successful!');
            
            // Store admin role in localStorage
            localStorage.setItem('adminRole', 'super_admin');
            localStorage.setItem('adminId', data.user.id);
            localStorage.setItem('adminPermissions', JSON.stringify(['products.all', 'orders.all', 'users.all']));
            
            // Redirect to admin dashboard
            navigate('/admin/dashboard');
            return;
          }
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
      const isB3FEmail = email === 'b3fprintingsolutions@gmail.com';
      
      // Check if the email is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (adminError) {
        throw new Error('Error verifying admin status');
      }
      
      // If B3F email but no admin record, create one
      if (isB3FEmail && !adminData) {
        const { error: createError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            role: 'super_admin',
            permissions: ['products.all', 'orders.all', 'users.all']
          } as any);
          
        if (createError) {
          console.error('Error creating admin account:', createError);
        }
      } else if (!adminData && !isB3FEmail) {
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
        console.log(`Development mode: OTP sent to ${email}. Check your email or Supabase logs.`);
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
      const isB3FEmail = email === 'b3fprintingsolutions@gmail.com';
      
      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user returned after verification');
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
        
        // If the user exists in auth but didn't exist in admin, update the record
        if (data.user && isB3FEmail && !admin.user_id) {
          await supabase
            .from('admin_users')
            .update({ 
              user_id: data.user.id,
              role: admin.role || 'super_admin',
              permissions: admin.permissions || ['products.all', 'orders.all', 'users.all']
            } as any)
            .eq('id', admin.id);
        }
        
        // Successfully authenticated as admin
        toast.success('Verification successful!');
        
        // Store admin role in localStorage
        localStorage.setItem('adminRole', admin.role || 'admin');
        localStorage.setItem('adminId', admin.user_id || (data.user?.id || admin.id));
        localStorage.setItem('adminPermissions', JSON.stringify(admin.permissions || []));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // For the B3F email, always create an admin record if missing
        if (isB3FEmail && data.user) {
          const { data: insertData, error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email: email,
              role: 'super_admin',
              permissions: ['products.all', 'orders.all', 'users.all'],
              // We need to explicitly cast the object to include user_id
              user_id: data.user.id
            } as any) // Using type assertion to bypass TypeScript error
            .select()
            .single();
            
          if (insertError) {
            throw new Error('Error creating admin account: ' + insertError.message);
          }
          
          if (insertData) {
            toast.success('Admin account created and verification successful!');
            
            // Store admin role in localStorage
            localStorage.setItem('adminRole', 'super_admin');
            localStorage.setItem('adminId', data.user.id);
            localStorage.setItem('adminPermissions', JSON.stringify(['products.all', 'orders.all', 'users.all']));
            
            // Redirect to admin dashboard
            navigate('/admin/dashboard');
            return;
          }
        } else {
          // User authenticated but is not an admin
          await supabase.auth.signOut();
          throw new Error('User is not authorized as admin');
        }
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
