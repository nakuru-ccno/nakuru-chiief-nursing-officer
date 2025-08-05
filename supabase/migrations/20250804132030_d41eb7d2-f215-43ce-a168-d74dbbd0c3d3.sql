-- Fix activity_types policies - add missing policies
CREATE POLICY "All authenticated users can view active activity types"
ON public.activity_types
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can insert activity types"
ON public.activity_types
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
);

CREATE POLICY "Admins can update activity types"
ON public.activity_types
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
);

CREATE POLICY "Admins can delete activity types"
ON public.activity_types
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
);