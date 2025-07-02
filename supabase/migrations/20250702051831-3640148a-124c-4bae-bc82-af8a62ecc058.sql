
-- Allow all authenticated users to view active activity types (they need to see them to select)
DROP POLICY IF EXISTS "Only admins can view activity types" ON public.activity_types;

CREATE POLICY "All users can view active activity types" 
ON public.activity_types 
FOR SELECT 
USING (is_active = true);

-- Keep admin-only policies for managing activity types
-- (insert, update, delete policies remain admin-only)
