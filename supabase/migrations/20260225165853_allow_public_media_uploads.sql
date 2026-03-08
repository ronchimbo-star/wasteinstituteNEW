/*
  # Allow Public Media Uploads

  1. Changes
    - Allow anonymous users to upload to media bucket (for initial setup)
    - Keep public read access

  2. Security Notes
    - This is for initial image setup
    - In production, you may want to restrict this to authenticated admins only
*/

-- Drop existing upload policy
DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;

-- Allow anyone to upload files to media bucket (for setup)
CREATE POLICY "Anyone Can Upload to Media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Allow anyone to update files in media bucket (for setup)
DROP POLICY IF EXISTS "Users Can Update Own Files" ON storage.objects;

CREATE POLICY "Anyone Can Update Media Files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');