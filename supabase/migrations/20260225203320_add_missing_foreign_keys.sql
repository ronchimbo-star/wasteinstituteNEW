/*
  # Add Missing Foreign Keys

  1. Foreign Keys Added
    - certificates.user_id -> user_profiles.id
    - course_enrollments.user_id -> user_profiles.id
    - course_enrollments.enrolled_by -> user_profiles.id
    - media_files.uploaded_by -> user_profiles.id
  
  2. Notes
    - Uses IF NOT EXISTS pattern to prevent errors if constraints already exist
    - These foreign keys enable proper joins in admin queries
*/

DO $$
BEGIN
  -- Add foreign key from certificates to user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'certificates_user_id_fkey'
  ) THEN
    ALTER TABLE certificates 
    ADD CONSTRAINT certificates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key from course_enrollments to user_profiles (user_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'course_enrollments_user_id_fkey'
  ) THEN
    ALTER TABLE course_enrollments 
    ADD CONSTRAINT course_enrollments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key from course_enrollments to user_profiles (enrolled_by)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'course_enrollments_enrolled_by_fkey'
  ) THEN
    ALTER TABLE course_enrollments 
    ADD CONSTRAINT course_enrollments_enrolled_by_fkey 
    FOREIGN KEY (enrolled_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key from media_files to user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'media_files_uploaded_by_fkey'
  ) THEN
    ALTER TABLE media_files 
    ADD CONSTRAINT media_files_uploaded_by_fkey 
    FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
