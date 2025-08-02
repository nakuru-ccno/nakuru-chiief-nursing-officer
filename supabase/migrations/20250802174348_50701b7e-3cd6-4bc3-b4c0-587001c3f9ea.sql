-- Enable the pg_cron extension for scheduling tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to check for reminder emails every 5 minutes
SELECT cron.schedule(
  'send-calendar-reminders',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://fjcwwvjvqtgjwrnobqwf.supabase.co/functions/v1/send-reminder-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqY3d3dmp2cXRnandybm9icXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTc1NjksImV4cCI6MjA2NTQ3MzU2OX0.AQUE-TD2_NqmyU90SMiPiK4aLfd_l_ojen92Qn8YT78"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);