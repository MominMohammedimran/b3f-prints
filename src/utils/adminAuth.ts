import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminUser } from '@/lib/types';

// Check if a user is an admin
export const isAdminUser = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isAdminUser:', error);
    return false;
  }
};

// Handle admin login
export const handleAdminLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (data.user) {
      const isAdmin = await isAdminUser(data.user.id);
      if (!isAdmin) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        throw new Error('You do not have admin privileges');
      }
      return data;
    } else {
      throw new Error('Login failed');
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    throw error;
  }
};

export const DEFAULT_ADMIN_PERMISSIONS = [
  "products.create",
  "products.read",
  "products.update",
  "products.delete",
  "orders.create",
  "orders.read",
  "orders.update",
  "orders.delete",
  "customers.create",
  "customers.read",
  "customers.update",
  "customers.delete",
];

export const isAdminSessionValid = async (): Promise<boolean> => {
  const adminUser = await validateAdminSession();
  return !!adminUser;
};

export const getAdminSession = async (): Promise<AdminUser | null> => {
  return await validateAdminSession();
};

// Define a concrete type for admin data from database to avoid recursive type inference
interface AdminRecord {
  id: string;
  email: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  permissions?: string[];
}

export const validateAdminSession = async (): Promise<AdminUser | null> => {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error("No valid session found:", sessionError);
      return null;
    }
    
    const email = session.user.email;
    
    // Query the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error || !data) {
      console.error("Not an admin user:", error);
      return null;
    }

    // Cast data to AdminRecord type to ensure type safety
    const adminRecord = data as AdminRecord;

    // Create a safe admin user object with fallbacks
    const adminUser: AdminUser = {
      id: adminRecord.id || '',
      email: adminRecord.email || email || '',
      role: adminRecord.role || 'admin',
      created_at: adminRecord.created_at || new Date().toISOString(),
      updated_at: adminRecord.updated_at || undefined,
      user_id: adminRecord.user_id || session.user.id || '',
      permissions: adminRecord.permissions || DEFAULT_ADMIN_PERMISSIONS
    };

    return adminUser;
  } catch (error) {
    console.error("Error validating admin session:", error);
    return null;
  }
};

// Add the missing functions for admin authentication
export const isAdminAuthenticated = async (): Promise<boolean> => {
  return await isAdminSessionValid();
};

export const getAdminDetails = async (): Promise<AdminUser | null> => {
  return await getAdminSession();
};

export const signOutAdmin = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem('adminLoggedIn');
};

export const initializeAdmin = async (userId: string, email: string): Promise<void> => {
  try {
    // Check if the admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingAdmin) {
      console.log('Admin already exists', existingAdmin);
      return;
    }
    
    // Create a new admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email,
        role: 'admin',
        permissions: DEFAULT_ADMIN_PERMISSIONS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('Admin created successfully', data);
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};
