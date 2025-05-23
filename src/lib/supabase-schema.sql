
-- Add RLS policies for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin_users that avoids recursion
CREATE POLICY "Allow auth users to view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (true);

-- Create function for checking if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
  );
END;
$$;

-- Create policies for admin operations
CREATE POLICY "Admins can read all data"
  ON public.orders
  FOR SELECT
  USING (
    is_admin(auth.email())
  );

CREATE POLICY "Admins can update all data"
  ON public.orders
  FOR UPDATE
  USING (
    is_admin(auth.email())
  );
