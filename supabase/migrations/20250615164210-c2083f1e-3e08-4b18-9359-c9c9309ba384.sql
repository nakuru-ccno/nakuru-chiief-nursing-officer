
-- Replace this UUID with your actual Auth user id (find it in Supabase > Auth > Users)
-- Find your UUID with: SELECT id, email FROM auth.users WHERE email = 'gitahijohnn@nakuru.go.ke';

-- Example UUID (replace below): '197c6d42-1945-419e-86a4-2d7eec8fba13'
INSERT INTO public.profiles
  (id, email, full_name, role, status, email_verified)
VALUES
  ('197c6d42-1945-419e-86a4-2d7eec8fba13', 'gitahijohnn@nakuru.go.ke', 'John Gitahi', 'System Administrator', 'active', true)
ON CONFLICT (id) DO UPDATE
SET
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  status = excluded.status,
  email_verified = excluded.email_verified;
