
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Use absolute URLs here instead of environment variables
const supabaseUrl = 'https://lbebqamzsrbeihzikmow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZWJxYW16c3JiZWloemlrbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTA0ODcsImV4cCI6MjA1OTAyNjQ4N30.XMVCIfANC8Mo8Mf4BLHjeOmd-XTg5HTzynTwhp6c0sE';

// Create a strongly typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const useSupabaseClient = () => supabase;