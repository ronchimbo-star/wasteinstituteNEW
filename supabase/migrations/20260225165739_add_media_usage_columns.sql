/*
  # Add Usage Tracking Columns to Media Files

  1. Changes
    - Add `alt_text` column for image accessibility
    - Add `usage_location` column to track where images are used
    - Add `updated_at` column for tracking modifications

  2. Notes
    - These columns help organize and track media usage across the site
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'alt_text'
  ) THEN
    ALTER TABLE media_files ADD COLUMN alt_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'usage_location'
  ) THEN
    ALTER TABLE media_files ADD COLUMN usage_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE media_files ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;