
-- Create a profiles table to store user information permanently
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'User',
  created_at timestamp with time zone DEFAULT now(),
  last_sign_in_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'System Administrator' 
           OR auth.users.raw_user_meta_data->>'role' = 'admin')
    )
  );

CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'System Administrator' 
           OR auth.users.raw_user_meta_data->>'role' = 'admin')
    )
  );

CREATE POLICY "Admins can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'System Administrator' 
           OR auth.users.raw_user_meta_data->>'role' = 'admin')
    )
  );

-- Insert existing admin users into profiles
INSERT INTO public.profiles (id, email, full_name, role) VALUES
('f445612b-cf1b-4a88-a752-9334af446a8c', 'admin@nakuru.go.ke', 'System Administrator', 'System Administrator'),
('8ecc6ae9-128c-42f7-ba4b-eec2af8469e2', 'tiongikevin2@gmail.com', 'Kevin Tiongi', 'System Administrator')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
