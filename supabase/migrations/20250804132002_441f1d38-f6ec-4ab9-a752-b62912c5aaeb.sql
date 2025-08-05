-- Add policies for tables with RLS enabled but no policies

-- Login history policies 
CREATE POLICY "Users can view their own login history"
ON public.login_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
ON public.login_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all login history"
ON public.login_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
);

-- Users table policies (legacy table - minimal access)
CREATE POLICY "Basic access to users table"
ON public.users
FOR SELECT
USING (true);