-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policy
CREATE POLICY "user_activities"
ON public.activities
AS PERMISSIVE
FOR ALL
TO public
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);
