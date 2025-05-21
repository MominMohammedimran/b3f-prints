
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { initializeAdmin, validateAdminSession } from '@/utils/adminAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Check if admin is already logged in
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setVerifying(true);
        
        // First check if we have a user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found user session, checking if admin");
          
          // Check if the user is an admin
          const admin = await validateAdminSession();
          
          if (admin) {
            console.log("Valid admin session found, redirecting");
            navigate('/admin/dashboard');
          } else {
            console.log("Not an admin user");
            // Just continue with login page
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setVerifying(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user returned from authentication');
      }
      
      console.log("User logged in, checking if admin");
      
      // Check if the user is an admin
      const adminData = await verifyAdminStatus(data.user.id, data.user.email || '');
      
      if (!adminData) {
        await supabase.auth.signOut(); // Sign out non-admin users
        toast.error('You do not have admin privileges');
        return;
      }
      
      // Successfully authenticated as admin
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  const verifyAdminStatus = async (userId: string, email: string) => {
    try {
      // First try to find existing admin record
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking admin status:", error);
        return null;
      }
      
      if (adminData) {
        console.log("Found existing admin record");
        return adminData;
      }
      
      // Only create admin for specific test email (hardcoded for demo)
      if (email === 'admin@example.com' || email === 'b3fprintingsolutions@gmail.com') {
        console.log("Creating new admin record for:", email);
        
        const { data: newAdmin, error: createError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating admin record:", createError);
          return null;
        }
        
        console.log("Created new admin record:", newAdmin);
        return newAdmin;
      }
      
      return null;
    } catch (error) {
      console.error("Error verifying admin status:", error);
      return null;
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Verifying admin status...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the admin dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>
        
        {/* Administrator notice */}
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            This page is only for administrators. If you are not an admin, please return to the main site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
