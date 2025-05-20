
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
import AdminEmailVerification from '@/components/admin/AdminEmailVerification';
import OTPValidation from '@/components/auth/OTPValidation';

// Define specific types for admin data records from the database
interface AdminRecord {
  id: string;
  email: string;
  role?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  permissions?: string[];
}

// Use concrete type definition
interface AdminData {
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
      if (currentUser) {
        try {
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
            // Explicitly cast to our concrete type
            const adminData = data as AdminData;
            
            // Create AdminUser from safe data with fallbacks
            setAdmin({
              id: adminData.id || '',
              email: adminData.email || '',
              role: adminData.role || 'admin',
              created_at: adminData.created_at || '',
              updated_at: adminData.updated_at || undefined,
              user_id: adminData.user_id || currentUser.id,
              permissions: adminData.permissions || []
            });
            
            // Redirect to admin dashboard if already logged in
            navigate('/admin/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setAdmin(null);
        }
      } else {
        setAdmin(null);
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
        
      if (adminCheckError) {
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
      
      // Check if user is in admin table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (adminError || !adminData) {
        // Special case for B3F email
        if (email === 'b3fprintingsolutions@gmail.com') {
          // Create admin record if it doesn't exist
          const { error: createError } = await supabase
            .from('admin_users')
            .insert({ 
              email: email,
              user_id: userId,
              role: 'admin',
              created_at: new Date().toISOString(),
              permissions: DEFAULT_ADMIN_PERMISSIONS
            });
            
          if (createError) {
            console.error("Error creating admin record:", createError);
            setError('Error creating admin account.');
            toast.error('Error creating admin account.');
            setLoading(false);
            return;
          }
        } else {
          setError('You are not authorized as an admin.');
          toast.error('You are not authorized as an admin.');
          await supabase.auth.signOut();
          setShowOtpForm(false);
          setLoading(false);
          return;
        }
      }
      
      toast.success('Admin verification successful!');
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Special case for the predefined admin
      if (email === 'b3fprintingsolutions@gmail.com' && password === 'Mmdimran@1') {
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
        
        // Check if admin record exists
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .maybeSingle();
          
        // Create admin record if it doesn't exist
        if (adminError || !adminData) {
          const { error: createError } = await supabase
            .from('admin_users')
            .insert({ 
              email: email,
              user_id: userId,
              role: 'admin',
              created_at: new Date().toISOString(),
              permissions: DEFAULT_ADMIN_PERMISSIONS
            });
            
          if (createError) {
            console.error("Error creating admin record:", createError);
            setError('Error creating admin account.');
            toast.error('Error creating admin account.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        }
        
        // Set admin state
        setAdmin({
          id: userId,
          email: email,
          role: 'admin',
          created_at: new Date().toISOString(),
          user_id: userId,
          permissions: DEFAULT_ADMIN_PERMISSIONS
        });
        
        toast.success('Admin login successful');
        navigate('/admin/dashboard');
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

      // Check if user's email is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (adminError || !adminData) {
        console.error("Admin check error:", adminError);
        setError('You are not authorized as an admin.');
        toast.error('You are not authorized as an admin.');
        await supabase.auth.signOut(); // Sign out if not an admin
        setLoading(false);
        return;
      }

      // Explicitly cast to our concrete type
      const adminRecord = adminData as AdminData;
      
      // Successfully found admin record
      console.log("Admin record found:", adminRecord);
      
      // Create the admin user object with fallbacks
      setAdmin({
        id: adminRecord.id || '',
        email: adminRecord.email || '',
        role: adminRecord.role || 'admin',
        created_at: adminRecord.created_at || '',
        updated_at: adminRecord.updated_at || undefined,
        user_id: adminRecord.user_id || userId,
        permissions: adminRecord.permissions || DEFAULT_ADMIN_PERMISSIONS
      });
      
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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
            <OTPValidation
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
          {usePasswordLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <div className="text-center mt-2">
                <Button 
                  variant="link" 
                  type="button"
                  onClick={() => setUsePasswordLogin(false)}
                >
                  Sign in with OTP instead
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <Button 
                onClick={handleSendOTP} 
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              <div className="text-center mt-2">
                <Button 
                  variant="link"
                  type="button"
                  onClick={() => setUsePasswordLogin(true)}
                >
                  Use password instead
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
