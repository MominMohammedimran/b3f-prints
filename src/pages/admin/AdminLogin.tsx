
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/lib/types';
import { DEFAULT_ADMIN_PERMISSIONS } from '@/utils/adminAuth';
import OTPValidation from '@/components/auth/OTPValidation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminOTPForm from '@/components/admin/AdminOTPForm';

// Define specific types for admin data records from the database
export interface AdminRecord {
  id: string;
  email: string;
  role?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  permissions?: string[];
}

const AdminLogin = () => {
  const { currentUser } = useAuth();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [usePasswordLogin, setUsePasswordLogin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
          console.log("Checking admin status for", currentUser.email);
          
          // Use explicit typing to avoid deep instantiation
          const { data, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', currentUser.email)
            .maybeSingle();

          if (adminError) {
            console.error('Error fetching admin data:', adminError);
            setAdmin(null);
          } else if (data) {
            // Type assertion with our defined interface
            const adminData = data as AdminRecord;
            
            // Create AdminUser from safe data with fallbacks
            setAdmin({
              id: adminData.id || '',
              email: adminData.email || '',
              role: adminData.role || 'admin',
              created_at: adminData.created_at || '',
              updated_at: adminData.updated_at || undefined,
              user_id: adminData.user_id || currentUser.id,
              permissions: adminData.permissions || DEFAULT_ADMIN_PERMISSIONS
            });
            
            // Redirect to admin dashboard if already logged in
            navigate('/admin/dashboard');
            toast.success('Admin session restored');
          }
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      // We first check if this email is an admin
      const { data: adminData, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (adminCheckError || !adminData) {
        // Special case for B3F email
        if (email !== 'b3fprintingsolutions@gmail.com') {
          toast.error('This email is not registered as an admin');
          setLoading(false);
          return;
        }
      }
      
      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      
      if (error) throw error;
      
      toast.success('Verification code sent to your email');
      setShowOtpForm(true);
      
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (token: string) => {
    setLoading(true);
    try {
      console.log(`Attempting to verify OTP for ${email} with token: ${token}`);
      // For development purposes only, accept a test token
      if (process.env.NODE_ENV === 'development' && token === '123456') {
        console.log("Using development test token");
        
        // For development, directly sign in without OTP verification
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'b3fprintingsolutions@gmail.com',
          password: 'Mmdimran@1',
        });
        
        if (error) throw error;
        
        // Get user ID from authentication result
        const userId = data.user?.id;
        
        if (!userId) {
          throw new Error('Authentication successful but user ID is missing');
        }
        
        await handleAdminCreation(userId, email);
        return;
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      
      if (error) throw error;

      // Get user ID from authentication result
      const userId = data.user?.id;
      
      if (!userId) {
        throw new Error('Authentication successful but user ID is missing');
      }
      
      console.log("OTP verification successful, user ID:", userId);
      
      await handleAdminCreation(userId, email);
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreation = async (userId: string, userEmail: string) => {
    try {
      // Check if user is in admin table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();
        
      if (adminError) {
        console.error("Error checking admin status:", adminError);
      }
        
      if (!adminData) {
        // Special case for B3F email
        if (userEmail === 'b3fprintingsolutions@gmail.com') {
          console.log("Creating admin record for the default admin account");
          // Create admin record if it doesn't exist
          const { data: newAdminData, error: createError } = await supabase
            .from('admin_users')
            .insert({ 
              email: userEmail,
              user_id: userId,
              role: 'admin',
              created_at: new Date().toISOString(),
              permissions: DEFAULT_ADMIN_PERMISSIONS
            })
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating admin record:", createError);
            setError('Error creating admin account.');
            toast.error('Error creating admin account.');
            return;
          }
          
          // Type assertion to ensure proper typing
          const adminRecord = newAdminData as AdminRecord;
          
          setAdmin({
            id: adminRecord.id,
            email: adminRecord.email,
            role: adminRecord.role || 'admin',
            created_at: adminRecord.created_at,
            user_id: adminRecord.user_id || userId,
            permissions: adminRecord.permissions || DEFAULT_ADMIN_PERMISSIONS
          });
        } else {
          setError('You are not authorized as an admin.');
          toast.error('You are not authorized as an admin.');
          await supabase.auth.signOut();
          setShowOtpForm(false);
          return;
        }
      } else {
        // Type assertion for the admin data
        const adminRecord = adminData as AdminRecord;
        
        setAdmin({
          id: adminRecord.id,
          email: adminRecord.email,
          role: adminRecord.role || 'admin',
          created_at: adminRecord.created_at,
          user_id: adminRecord.user_id || userId,
          permissions: adminRecord.permissions || DEFAULT_ADMIN_PERMISSIONS
        });
      }
      
      toast.success('Admin verification successful!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Admin creation error:', error);
      setError(error.message || 'Error creating admin account');
      toast.error(error.message || 'Error creating admin account');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Special case for the predefined admin
      if (email === 'b3fprintingsolutions@gmail.com' && password === 'Mmdimran@1') {
        console.log("Attempting login with predefined admin credentials");
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          console.error("Login error:", error);
          setError(error.message);
          toast.error(error.message);
          setLoading(false);
          return;
        }

        // Get user ID from authentication result
        const userId = data.user?.id;
        
        if (!userId) {
          throw new Error('Authentication successful but user ID is missing');
        }
        
        console.log("Admin login successful, user ID:", userId);
        
        await handleAdminCreation(userId, email);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Get user ID from authentication result
      const userId = data.user?.id;
      
      if (!userId) {
        throw new Error('Authentication successful but user ID is missing');
      }

      console.log("User authenticated, checking admin status");
      
      await handleAdminCreation(userId, email);
      
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You are already logged in as admin.</h1>
          <Button onClick={() => navigate('/admin/dashboard')}>Go to Admin Dashboard</Button>
        </div>
      </div>
    );
  }
  
  if (showOtpForm) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Verification</CardTitle>
            <CardDescription>Enter the verification code sent to your email</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminOTPForm 
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleSendOTP}
              onBack={() => setShowOtpForm(false)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
