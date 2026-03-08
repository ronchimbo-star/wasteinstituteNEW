/*
  # Allow Public Media Files Insert

  1. Changes
    - Allow anyone to insert media files (for initial setup)
    
  2. Security Notes
    - This is for initial image setup only
    - In production, restrict to admins only
*/

-- Drop existing admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert media files" ON media_files;

-- Allow anyone to insert media files (for setup)
CREATE POLICY "Anyone can insert media files"
  ON media_files
  FOR INSERT
  WITH CHECK (true);