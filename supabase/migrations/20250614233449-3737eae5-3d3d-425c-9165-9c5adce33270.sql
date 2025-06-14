
-- Update the profiles table to support the new specific roles
-- First, let's add some default roles if they don't exist
UPDATE public.profiles 
SET role = 'System Administrator' 
WHERE role = 'admin' OR role IS NULL;

-- You can also manually update specific users to have the new roles
-- For example:
-- UPDATE public.profiles 
-- SET role = 'Nakuru County Chief Nursing Officer' 
-- WHERE email = 'specific-email@nakuru.go.ke';

-- UPDATE public.profiles 
-- SET role = 'Nakuru County Deputy Chief Nursing Officer' 
-- WHERE email = 'another-email@nakuru.go.ke';
