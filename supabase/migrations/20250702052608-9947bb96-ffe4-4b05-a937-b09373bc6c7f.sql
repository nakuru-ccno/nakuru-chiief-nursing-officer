
-- Enable the pgcrypto extension for password encryption required by the create_admin_user function
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Re-create (replace) the create_admin_user function after the extension is installed
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
