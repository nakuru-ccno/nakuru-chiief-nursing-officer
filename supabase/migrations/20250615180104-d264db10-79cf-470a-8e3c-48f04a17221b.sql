
-- 1. Update the trigger function so new signups are created as status 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, email_verified, created_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'Staff Nurse'),
    'pending',  -- <<< DEFAULT TO PENDING
    false,      -- not verified/pending at signup
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Backfill: Force status = 'pending' for all users who are not admin/active
UPDATE public.profiles
SET status = 'pending', email_verified = false
WHERE status = 'active'
  AND (email_verified = false OR (full_name IS NULL OR full_name = '' OR role IS NULL OR role = 'Staff Nurse'))
  AND email NOT IN ('admin@nakuru.go.ke'); -- Add more admin emails as needed

