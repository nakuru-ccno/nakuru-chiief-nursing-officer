-- Drop the problematic trigger and function that's causing the error
DROP TRIGGER IF EXISTS notify_user_on_new_event_trigger ON calendar_events;

-- Update the function to not use http_post which doesn't exist
CREATE OR REPLACE FUNCTION public.notify_user_on_new_event()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  -- Simply return new without making HTTP calls since net.http_post doesn't exist
  -- This prevents the error when saving calendar events
  return new;
end;
$function$;