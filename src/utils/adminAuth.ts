// src/utils/adminAuth.ts
import { supabase } from '@/integrations/supabase/client';

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
