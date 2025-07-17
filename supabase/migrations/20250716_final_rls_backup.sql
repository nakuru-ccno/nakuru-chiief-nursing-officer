-- 🔐 Enable Row-Level Security on the activities table
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ✅ SELECT: Allow users to see their own, and admins to see all
CREATE POLICY "Users and Admins can view activities"
ON public.activities
FOR SELECT
TO public
USING (
  submitted_by = auth.email()
  OR get_current_user_role() = ANY (ARRAY['admin', 'System Administrator'])
);

-- ✅ INSERT: Only allow users to create activities for themselves
CREATE POLICY "User can create their own activities"
ON public.activities
FOR INSERT
TO public
WITH CHECK (
  submitted_by = auth.email()
);

-- ✅ UPDATE: Users can update their own, admins can update any
CREATE POLICY "User can update their own activities"
ON public.activities
FOR UPDATE
TO public
USING (
  submitted_by = auth.email()
  OR get_current_user_role() = ANY (ARRAY['admin', 'System Administrator'])
)
WITH CHECK (
  submitted_by = auth.email()
  OR get_current_user_role() = ANY (ARRAY['admin', 'System Administrator'])
);

-- ✅ DELETE: Users can delete their own, admins can delete any
CREATE POLICY "User can delete their own activities"
ON public.activities
FOR DELETE
TO public
USING (
  submitted_by = auth.email()
  OR get_current_user_role() = ANY (ARRAY['admin', 'System Administrator'])
);
