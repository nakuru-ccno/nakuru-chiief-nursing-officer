
-- Create activity types table for better management
CREATE TABLE public.activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on activity types (only admins can manage)
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity types
CREATE POLICY "Only admins can view activity types" 
ON public.activity_types 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

-- Only admins can insert activity types
CREATE POLICY "Only admins can insert activity types" 
ON public.activity_types 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

-- Only admins can update activity types
CREATE POLICY "Only admins can update activity types" 
ON public.activity_types 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

-- Only admins can delete activity types
CREATE POLICY "Only admins can delete activity types" 
ON public.activity_types 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

-- Insert default activity types
INSERT INTO public.activity_types (name, description) VALUES 
('meetings', 'Team meetings and conferences'),
('administrative', 'Administrative tasks and paperwork'),
('training', 'Training sessions and workshops'),
('documentation', 'Documentation and reporting'),
('supervision', 'Supervision and oversight activities'),
('general', 'General activities'),
('inventory', 'Inventory management and tracking');

-- Create a security definer function to get current user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop existing policies and recreate with stronger security
DROP POLICY IF EXISTS "Users can view own activities or admins view all" ON public.activities;
DROP POLICY IF EXISTS "Users can create own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can edit own activities or admins edit all" ON public.activities;
DROP POLICY IF EXISTS "Users can remove own activities or admins remove all" ON public.activities;

-- Create bulletproof RLS policies using the security definer function
CREATE POLICY "Strict user activity isolation" 
ON public.activities 
FOR SELECT 
USING (
  submitted_by = auth.email() OR 
  public.get_current_user_role() IN ('admin', 'System Administrator')
);

CREATE POLICY "Users can only create own activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (
  submitted_by = auth.email() AND 
  submitted_by IS NOT NULL
);

CREATE POLICY "Strict activity update control" 
ON public.activities 
FOR UPDATE 
USING (
  submitted_by = auth.email() OR 
  public.get_current_user_role() IN ('admin', 'System Administrator')
) 
WITH CHECK (
  submitted_by = auth.email() OR 
  public.get_current_user_role() IN ('admin', 'System Administrator')
);

CREATE POLICY "Strict activity delete control" 
ON public.activities 
FOR DELETE 
USING (
  submitted_by = auth.email() OR 
  public.get_current_user_role() IN ('admin', 'System Administrator')
);
