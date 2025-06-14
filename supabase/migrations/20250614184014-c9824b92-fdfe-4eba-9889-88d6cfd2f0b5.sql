
-- Reset the password for admin@nakuru.go.ke
UPDATE auth.users 
SET 
  encrypted_password = crypt('AdminPass123!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@nakuru.go.ke';

-- Reset the password for tiongikevin2@gmail.com  
UPDATE auth.users 
SET 
  encrypted_password = crypt('KevinPass123!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'tiongikevin2@gmail.com';

-- Also ensure both accounts are confirmed and active
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmation_token = '',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
  raw_user_meta_data = '{"full_name": "System Administrator", "role": "admin"}'
WHERE email = 'admin@nakuru.go.ke';

UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmation_token = '',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
  raw_user_meta_data = '{"full_name": "Kevin Tiongi", "role": "admin"}'
WHERE email = 'tiongikevin2@gmail.com';
