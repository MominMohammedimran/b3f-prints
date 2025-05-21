
// src/utils/adminAuth.ts
import { supabase } from '@/integrations/supabase/client';

// Define default admin permissions
export const DEFAULT_ADMIN_PERMISSIONS = [
  'view_dashboard',
  'manage_products',
  'manage_orders',
  'manage_users',
  'manage_settings'
];

// Function to check if a user is an admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

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
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Function to verify admin authentication
export const isAdminAuthenticated = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    // Check if the user is in admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', session.user.email)
      .single();
      
    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return false;
  }
};

// Add a basic checks for admin status
export const verifyAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    // First check if the user exists in the admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (adminError || !adminUser) {
      console.error('Error verifying admin status:', adminError);
      return false;
    }

    // Since our admin_users table may not have role, user_id, or permissions columns,
    // we'll just check if the user exists in the admin_users table
    return true;
  } catch (error) {
    console.error('Error in admin verification:', error);
    return false;
  }
};

// Function to sign out admin
export const signOutAdmin = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Function to validate admin session
export const validateAdminSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    return isAdminAuthenticated();
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
};

// Function to initialize admin user
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
    
    // Create a new admin user with basic fields
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: email,
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
