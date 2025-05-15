
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define simple, non-recursive interfaces
interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string | undefined;
  created_at: string;
}

const AdminLogin = () => {
  const { currentUser } = useAuth();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

          if (adminError) {
            console.error('Error fetching admin data:', adminError);
            setAdmin(null);
          } else if (adminData) {
            // Create admin user with explicit fields
            setAdmin({
              id: adminData.id,
              user_id: adminData.user_id || currentUser.id,
              email: adminData.email,
              role: adminData.role,
              created_at: adminData.created_at
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        .single();

      if (adminError) {
        console.error("Admin check error:", adminError);
        setError('You are not authorized as an admin.');
        toast.error('You are not authorized as an admin.');
        await supabase.auth.signOut(); // Sign out if not an admin
        setLoading(false);
        return;
      }

      // Successfully found admin record
      console.log("Admin record found:", adminData);
      
      // Update the admin_users record with user_id if it doesn't exist
      if (!adminData.user_id) {
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ user_id: userId })
          .eq('id', adminData.id);
          
        if (updateError) {
          console.error("Error updating admin user_id:", updateError);
        }
      }

      // Set admin state and navigate
      setAdmin({
        id: adminData.id,
        user_id: adminData.user_id || userId,
        email: adminData.email,
        role: adminData.role,
        created_at: adminData.created_at
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

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
