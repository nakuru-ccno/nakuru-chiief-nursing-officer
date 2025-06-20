
-- Drop all existing policies on activities table
DROP POLICY IF EXISTS "Users can view their own activities or admins can view all" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update their own activities or admins can update all" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their own activities or admins can delete all" ON public.activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON public.activities;

-- Ensure RLS is enabled
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create new policies for proper data isolation
CREATE POLICY "Users can view own activities or admins view all" 
ON public.activities 
FOR SELECT 
USING (
  submitted_by = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

CREATE POLICY "Users can create own activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (submitted_by = auth.email());

CREATE POLICY "Users can edit own activities or admins edit all" 
ON public.activities 
FOR UPDATE 
USING (
  submitted_by = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

CREATE POLICY "Users can remove own activities or admins remove all" 
ON public.activities 
FOR DELETE 
USING (
  submitted_by = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);
