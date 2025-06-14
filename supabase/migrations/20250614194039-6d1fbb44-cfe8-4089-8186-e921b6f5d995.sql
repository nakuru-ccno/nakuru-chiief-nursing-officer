
-- Update the existing user to mark their email as confirmed
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'wendyT@nakuru.go.ke';

-- Also update any other users that might have the same issue
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
