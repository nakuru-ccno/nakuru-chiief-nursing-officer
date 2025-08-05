-- Fix calendar_events RLS policies for proper user access
-- Enable RLS on tables that don't have it
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Fix calendar_events policies to allow proper insert/update/delete
DROP POLICY IF EXISTS "Users can see their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow delete for calendar events" ON public.calendar_events;

-- Create comprehensive calendar_events policies
CREATE POLICY "Users can manage their own calendar events"
ON public.calendar_events
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin access to calendar events
CREATE POLICY "Admins can view all calendar events"
ON public.calendar_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'System Administrator')
  )
);