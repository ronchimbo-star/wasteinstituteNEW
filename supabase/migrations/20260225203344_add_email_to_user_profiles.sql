/*
  # Add Email to User Profiles

  1. Changes
    - Add email column to user_profiles table
    - Populate existing emails from auth.users
    - Update trigger to sync email on profile creation
  
  2. Notes
    - Email is stored in user_profiles for easy querying
    - Synced from auth.users automatically
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Populate emails from auth.users for existing profiles
UPDATE user_profiles
SET email = au.email
FROM auth.users au
WHERE user_profiles.id = au.id
AND user_profiles.email IS NULL;

-- Update the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
