/*
  # Create Media Storage Bucket

  1. Storage Setup
    - Create 'media' bucket for file uploads
    - Enable public access for media files
    - Set up storage policies for uploads and access

  2. Security
    - Allow authenticated users to upload files
    - Allow public read access to all files
    - Restrict deletion to file owners
*/

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media files" ON storage.objects;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy: Allow public read access to media files
CREATE POLICY "Public can view media files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update own media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid())
WITH CHECK (bucket_id = 'media' AND owner = auth.uid());

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete own media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid());
