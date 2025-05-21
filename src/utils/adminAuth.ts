
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/lib/types";

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
    
    // Check for typo in the target email address - b3fprintingsolutions@gmai.com should be b3fprintingsolutions@gmail.com
    // Let's check both versions to accommodate either spelling
    const checkEmails = [email];
    
    // If the email is the b3fprintingsolutions one with the typo, add the corrected version to check
    if (email === 'b3fprintingsolutions@gmai.com') {
      checkEmails.push('b3fprintingsolutions@gmail.com');
    } else if (email === 'b3fprintingsolutions@gmail.com') {
      checkEmails.push('b3fprintingsolutions@gmai.com');
    }
    
    // Query the admin_users table for either email
    let data = null;
    let error = null;

    for (const emailToCheck of checkEmails) {
      const result = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', emailToCheck)
        .maybeSingle();
        
      if (!result.error && result.data) {
        data = result.data;
        break;
      } else {
        error = result.error;
      }
    }
    
    // If no match found, create an admin user for the target email (if it matches our target)
    if (!data && (email === 'b3fprintingsolutions@gmai.com' || email === 'b3fprintingsolutions@gmail.com')) {
      console.log("Creating missing admin user for:", email);
      
      // Create admin user record
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: email,
          role: 'super_admin',
          permissions: DEFAULT_ADMIN_PERMISSIONS,
          user_id: session.user.id
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating admin user:", createError);
      } else {
        console.log("Admin user created successfully:", newAdmin);
        data = newAdmin;
      }
    }
    
    if (error && !data) {
      console.error("Admin table query error:", error);
      return null;
    }
    
    if (!data) {
      console.error("Not an admin user, no matching record found");
      return null;
    }

    console.log("Found admin record:", data);

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
  try {
    const isValid = await isAdminSessionValid();
    console.log("Admin authentication check result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Admin authentication check error:", error);
    return false;
  }
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
  const typoEmail = 'b3fprintingsolutions@gmai.com';
  
  try {
    // Check if admin exists with either email
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .in('email', [adminEmail, typoEmail])
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking admin existence:', checkError);
    }
    
    if (!existingAdmin) {
      // Get the user ID if possible
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .in('email', [adminEmail, typoEmail])
        .maybeSingle();
      
      const userId = userData?.id || 'pending-user-id';
      
      // Create the admin for both email versions to be safe
      const emails = [adminEmail, typoEmail];
      for (const email of emails) {
        const { error: createError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            user_id: userId,
            role: 'super_admin',
            permissions: DEFAULT_ADMIN_PERMISSIONS,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (createError) {
          console.error(`Error creating main admin for ${email}:`, createError);
        } else {
          console.log(`Main admin account created successfully for ${email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in ensureMainAdminExists:', error);
  }
};
