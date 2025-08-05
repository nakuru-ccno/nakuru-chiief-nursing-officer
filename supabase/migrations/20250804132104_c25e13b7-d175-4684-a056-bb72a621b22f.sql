-- Fix policies for "activities type" table
CREATE POLICY "Allow read access to activities type"
ON public."activities type"
FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify activities type"
ON public."activities type" 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
);