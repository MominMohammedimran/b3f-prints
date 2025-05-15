
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
}

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

// Define AdminDbResponse interface to avoid infinite type instantiation
interface AdminDbResponse {
  id: string;
  user_id?: string;
  email: string;
  role?: string;
  permissions?: string[];
  created_at: string;
  updated_at?: string;
}

export const isAdminSessionValid = async (): Promise<boolean> => {
  const adminUser = await validateAdminSession();
  return !!adminUser;
};

export const getAdminSession = async (): Promise<AdminUser | null> => {
  return await validateAdminSession();
};

export const validateAdminSession = async (): Promise<AdminUser | null> => {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error("No valid session found:", sessionError);
      return null;
    }
    
    const email = session.user.email;
    
    // Query the admin_users table instead of admins
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error || !data) {
      console.error("Not an admin user:", error);
      return null;
    }

    // Type assertion to ensure we have the right fields
    const adminData = data as AdminDbResponse;

    // Create a safe admin user object with fallbacks
    const adminUser: AdminUser = {
      id: adminData.id || '',
      user_id: adminData.user_id || adminData.id || '',
      email: adminData.email || email || '',
      role: adminData.role || 'admin',
      permissions: Array.isArray(adminData.permissions) ? adminData.permissions : DEFAULT_ADMIN_PERMISSIONS,
      created_at: adminData.created_at || new Date().toISOString()
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
