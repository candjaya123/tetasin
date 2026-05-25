BEGIN;
DO $$$
DECLARE 
  v_tid UUID; 
  v_name TEXT := 'Test Biz'; 
  v_type TEXT := 'business';
  v_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO tenants (name, account_type) VALUES (v_name, v_type) RETURNING id INTO v_tid;
  -- Fake user bypass
  -- INSERT INTO auth.users (id, email) VALUES (v_id, 'fake@test.com');
  
  -- We just want to check if the public schema inserts fail
  -- Let's just catch the error and raise it
  -- To bypass foreign key, we can disable triggers or just create the auth user directly.
  -- But wait, auth.users is protected.
  -- The easiest way is to let the user create an account and we check why it failed.
END $$$;
ROLLBACK;