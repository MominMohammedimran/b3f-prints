import { supabase } from "@/integrations/supabase/client";

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

export const getAdminSession = async () => {
  return await validateAdminSession();
};

// Define a concrete type for admin data
export interface AdminUser {
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
    console.log("Validating admin session");
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error("No valid session found:", sessionError);
      return null;
    }
    
    const email = session.user.email;
    
    if (!email) {
      console.error("User email is missing in session");
      return null;
    }
    
    console.log("Found session for email:", email);
    
    // Query the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error("Admin table query error:", error);
      return null;
    }
    
    if (!data) {
      console.error("Not an admin user, no matching record found");
      return null;
    }

    console.log("Found admin record:", data);

    // Create a safe admin user object with fallbacks
    const adminUser: AdminUser = {
      id: data.id || '',
      email: data.email || email || '',
      role: data.role || 'admin',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      user_id: data.user_id || session.user.id || '',
      permissions: data.permissions || DEFAULT_ADMIN_PERMISSIONS
    };

    return adminUser;
  } catch (error) {
    console.error("Error validating admin session:", error);
    return null;
  }
};

export const isAdminAuthenticated = async (): Promise<boolean> => {
  try {
    const isValid = await isAdminSessionValid();
    console.log("Admin authentication check result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Admin authentication check error:", error);
    return false;
  }
};

export const getAdminDetails = async () => {
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
      .maybeSingle();
    
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

// Create a specific admin user function for the B3F email
export const ensureMainAdminExists = async (): Promise<void> => {
  const adminEmail = 'b3fprintingsolutions@gmail.com';
  
  try {
    // Check if admin exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking admin existence:', checkError);
    }
    
    if (!existingAdmin) {
      // Get the user ID if possible
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle();
      
      const userId = userData?.id || 'pending-user-id';
      
      // Create the admin
      const { error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: adminEmail,
          user_id: userId,
          role: 'super_admin',
          permissions: DEFAULT_ADMIN_PERMISSIONS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (createError) {
        console.error('Error creating main admin:', createError);
      } else {
        console.log('Main admin account created successfully');
      }
    }
  } catch (error) {
    console.error('Error in ensureMainAdminExists:', error);
  }
};
