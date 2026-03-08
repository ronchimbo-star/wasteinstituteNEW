/*
  # User Profile Auto-Creation Trigger

  ## Purpose
  Automatically creates a user_profile record when a new user signs up via Supabase Auth.
  The super admin email (ronchimbo@gmail.com) is automatically assigned the 'super_admin' role.

  ## Changes
  1. Creates a function that inserts a user_profile after user creation
  2. Sets up a trigger on auth.users insert
  3. Automatically assigns super_admin role to ronchimbo@gmail.com
*/

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NEW.email = 'ronchimbo@gmail.com' THEN 'super_admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();