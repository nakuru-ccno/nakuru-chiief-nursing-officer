
-- Enable RLS on activities table if not already enabled
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own activities
CREATE POLICY "Users can view their own activities" 
ON public.activities 
FOR SELECT 
USING (
  submitted_by = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

-- Create policy for users to insert their own activities
CREATE POLICY "Users can insert their own activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (submitted_by = auth.email());

-- Create policy for users to update their own activities (admins can update any)
CREATE POLICY "Users can update their own activities" 
ON public.activities 
FOR UPDATE 
USING (
  submitted_by = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);

-- Create policy for users to delete their own activities (admins can delete any)
CREATE POLICY "Users can delete their own activities" 
ON public.activities 
FOR DELETE 
USING (
  submitted_by = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'System Administrator')
  )
);
