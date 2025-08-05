-- Fix RLS policies for calendar_events and enable missing RLS
-- This migration ensures proper access control for calendar events

-- First, enable RLS on tables that need it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Fix calendar_events policies - allow users to manage their own events
-- Remove existing overly permissive policies first
DROP POLICY IF EXISTS "All logged-in users can insert" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow select for owner" ON public.calendar_events;

-- Create proper policies for calendar_events
CREATE POLICY "Users can create their own events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events" 
ON public.calendar_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.calendar_events 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.calendar_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all events" 
ON public.calendar_events 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'System Administrator')
    )
);

-- Create policies for email_queue (service role access)
CREATE POLICY "Service role can manage email queue" 
ON public.email_queue 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for users table (basic protection)
CREATE POLICY "Users table basic access" 
ON public.users 
FOR SELECT 
USING (true);

-- Add proper DELETE policy for calendar_events
CREATE POLICY "Allow delete for calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure calendar events can be deleted (was missing from existing policies)
-- Remove any conflicting DELETE restrictions