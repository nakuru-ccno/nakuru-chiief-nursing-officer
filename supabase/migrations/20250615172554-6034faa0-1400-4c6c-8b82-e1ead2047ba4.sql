
-- 1. Backfill: Insert profiles for any Auth user not present in the profiles table.
INSERT INTO public.profiles (id, email, full_name, role, status, email_verified)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', u.email), 
  COALESCE(u.raw_user_meta_data->>'role', 'Staff Nurse'), 
  'active',
  true
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 2. Create a trigger function to auto-create a profile when a new Auth user is registered.
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
    'active',
    true,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Create the trigger (if not already present)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
