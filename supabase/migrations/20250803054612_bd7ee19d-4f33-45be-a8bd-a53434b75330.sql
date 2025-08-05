-- Create edge function for sending email notifications on user signup and signin
-- This migration adds the infrastructure for email notifications
-- The actual email sending will be handled by edge functions

-- Create table to track email notifications if not exists
CREATE TABLE IF NOT EXISTS public.email_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    notification_type text NOT NULL CHECK (notification_type IN ('signup', 'signin', 'calendar_reminder')),
    sent_at timestamp with time zone DEFAULT now(),
    template_data jsonb DEFAULT '{}',
    status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Enable RLS on email notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for email notifications (only admins can view all, users can view their own)
CREATE POLICY "Users can view their own notifications" 
ON public.email_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" 
ON public.email_notifications 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'System Administrator')
    )
);

-- Allow the service role to insert notifications
CREATE POLICY "Service role can insert notifications" 
ON public.email_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON public.email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON public.email_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON public.email_notifications(sent_at);