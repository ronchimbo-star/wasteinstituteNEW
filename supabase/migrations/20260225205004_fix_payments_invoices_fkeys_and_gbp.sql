/*
  # Fix Payments and Invoices Foreign Keys and Add Currency Support

  1. Changes
    - Drop incorrect foreign keys pointing to non-existent 'users' table
    - Create correct foreign keys pointing to 'user_profiles' table
    - Change default currency from USD to GBP
    - Add currency preferences to site settings and user profiles
  
  2. Tables Updated
    - payments: user_id -> user_profiles.id
    - invoices: user_id -> user_profiles.id
    - site_settings: add default_currency
    - user_profiles: add preferred_currency
  
  3. Notes
    - All existing records will be updated to GBP
    - Default currency is now GBP (£)
*/

-- Drop incorrect foreign keys
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;

-- Create correct foreign keys pointing to user_profiles
ALTER TABLE payments 
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE invoices 
ADD CONSTRAINT invoices_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add default_currency to site_settings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' AND column_name = 'default_currency'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN default_currency TEXT DEFAULT 'GBP';
  END IF;
END $$;

-- Update site_settings to use GBP as default
UPDATE site_settings SET default_currency = 'GBP' WHERE default_currency IS NULL OR default_currency = 'USD';

-- Add preferred_currency to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'preferred_currency'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferred_currency TEXT DEFAULT 'GBP';
  END IF;
END $$;

-- Update all existing payments to GBP
UPDATE payments SET currency = 'GBP' WHERE currency = 'USD' OR currency IS NULL;

-- Update all existing invoices to GBP
UPDATE invoices SET currency = 'GBP' WHERE currency = 'USD' OR currency IS NULL;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
