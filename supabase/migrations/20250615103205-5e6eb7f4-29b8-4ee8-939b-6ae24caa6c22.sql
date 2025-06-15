
-- Add status column to profiles table to track user status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add email_verified column to track email verification status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Add approved_by column to track who approved the user
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);

-- Add approved_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Update existing profiles to be active and verified
UPDATE public.profiles 
SET status = 'active', email_verified = true 
WHERE status IS NULL OR email_verified IS NULL;

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Create a function to create user accounts without email verification
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_full_name text,
  user_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Create the auth user with email confirmation disabled
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    format('{"full_name":"%s"}', user_full_name)::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create the profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    status,
    email_verified,
    approved_by,
    approved_at
  ) VALUES (
    new_user_id,
    user_email,
    user_full_name,
    user_role,
    'active',
    true,
    auth.uid(),
    NOW()
  );

  result := json_build_object(
    'user_id', new_user_id,
    'email', user_email,
    'success', true
  );

  RETURN result;
EXCEPTION
  WHEN others THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;
