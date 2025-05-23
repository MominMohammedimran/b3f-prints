
import { supabase } from '@/integrations/supabase/client';

// These were missing in the original code
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

// Check if the current user is an authenticated admin
export const isAdminAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    // Use direct query without self-referencing the admin_users table
    // This prevents infinite recursion in RLS policies
    const { data: adminData, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();
      
    if (error || !adminData) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Sign out the admin user
export const signOutAdmin = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminPermissions');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Initialize admin with default permissions if they don't exist
export const initializeAdmin = async (userId: string, email: string): Promise<void> => {
  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (existingAdmin) {
      return; // Admin already exists, nothing to do
    }
    
    // Create new admin user with default permissions
    await supabase
      .from('admin_users')
      .insert({
        email,
        user_id: userId,
        role: 'admin',
        permissions: DEFAULT_ADMIN_PERMISSIONS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};

// Ensure the main admin exists (for B3F email)
export const ensureMainAdminExists = async (): Promise<void> => {
  const mainAdminEmail = 'b3fprintingsolutions@gmail.com';
  const altAdminEmail = 'b3fprintingsolutions@gmai.com'; // Alternative email with typo
  
  try {
    // Check if admin exists under either email
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .or(`email.eq.${mainAdminEmail},email.eq.${altAdminEmail}`)
      .maybeSingle();
      
    if (existingAdmin) {
      return; // Admin already exists
    }
    
    // Create the admin user
    await supabase
      .from('admin_users')
      .insert({
        email: mainAdminEmail,
        role: 'super_admin',
        permissions: ['products.all', 'orders.all', 'users.all'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    console.log('Main admin created successfully');
  } catch (error) {
    console.error('Error ensuring main admin exists:', error);
  }
};

// Validate an admin session
export const validateAdminSession = async (): Promise<boolean> => {
  return await isAdminAuthenticated();
};
