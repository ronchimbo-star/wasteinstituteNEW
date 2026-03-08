/*
  # Create Media Storage Bucket and Policies

  1. Storage Bucket
    - Create 'media' bucket for public image access

  2. Security Policies
    - Allow public read access to all files
    - Allow authenticated users to upload files
    - Allow file owners to update/delete their files

  3. Notes
    - The media bucket will store all site images
    - Images are publicly accessible for display on the website
*/

-- Create media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access to Media Files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Update Own Files" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Files" ON storage.objects;

-- Allow anyone to read files from media bucket
CREATE POLICY "Public Access to Media Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow users to update their own files
CREATE POLICY "Users Can Update Own Files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'media' AND auth.uid()::text = owner::text);

-- Allow users to delete their own files
CREATE POLICY "Users Can Delete Own Files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = owner::text);