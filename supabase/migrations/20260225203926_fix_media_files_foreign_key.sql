/*
  # Fix Media Files Foreign Key

  1. Changes
    - Drop incorrect foreign key pointing to non-existent 'users' table
    - Create correct foreign key pointing to 'user_profiles' table
  
  2. Notes
    - uploaded_by can be null for system uploads
    - Uses ON DELETE SET NULL to preserve media files
*/

-- Drop incorrect foreign key
ALTER TABLE media_files DROP CONSTRAINT IF EXISTS media_files_uploaded_by_fkey;

-- Create correct foreign key pointing to user_profiles
ALTER TABLE media_files 
ADD CONSTRAINT media_files_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
