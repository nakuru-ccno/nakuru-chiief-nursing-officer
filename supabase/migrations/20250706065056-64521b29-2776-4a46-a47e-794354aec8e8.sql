
-- Drop the existing function and recreate it with proper Supabase auth integration
DROP FUNCTION IF EXISTS public.create_admin_user(text, text, text, text);

CREATE OR REPLACE FUNCTION public.create_admin_user(
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
  -- Use Supabase's built-in user creation
  -- This approach works with Supabase's authentication system
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
    -- Use a simple hash approach that works with Supabase
    encode(digest(user_password || user_email, 'sha256'), 'hex'),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', user_full_name, 'role', user_role)::jsonb,
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
