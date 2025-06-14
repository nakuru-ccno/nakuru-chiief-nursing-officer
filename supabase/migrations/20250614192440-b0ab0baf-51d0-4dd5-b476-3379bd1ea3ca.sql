
-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create policies that allow proper user management
-- Allow authenticated users to view all profiles (needed for user management)
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated users to insert profiles (needed for user creation)
CREATE POLICY "Users can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update profiles (needed for user editing)
CREATE POLICY "Users can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete profiles (needed for user deletion)
CREATE POLICY "Users can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated
  USING (true);
