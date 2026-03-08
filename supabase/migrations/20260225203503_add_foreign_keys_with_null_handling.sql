/*
  # Add Foreign Keys with Null Handling

  1. Foreign Keys Added
    - certificates.user_id -> user_profiles.id
    - course_enrollments.user_id -> user_profiles.id
    - course_enrollments.enrolled_by -> user_profiles.id (nullable)
    - media_files.uploaded_by -> user_profiles.id (nullable)
  
  2. Notes
    - Media files can have null uploaded_by (system uploads)
    - Enrolled_by can be null for self-enrollments
    - Uses proper ON DELETE behaviors
*/

-- Add foreign key from certificates to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'certificates_user_id_fkey'
    AND table_name = 'certificates'
  ) THEN
    ALTER TABLE certificates 
    ADD CONSTRAINT certificates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from course_enrollments to user_profiles (user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'course_enrollments_user_id_fkey'
    AND table_name = 'course_enrollments'
  ) THEN
    ALTER TABLE course_enrollments 
    ADD CONSTRAINT course_enrollments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from course_enrollments to user_profiles (enrolled_by) - nullable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'course_enrollments_enrolled_by_fkey'
    AND table_name = 'course_enrollments'
  ) THEN
    -- Only add if all enrolled_by values are either null or exist in user_profiles
    IF NOT EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE enrolled_by IS NOT NULL 
      AND enrolled_by NOT IN (SELECT id FROM user_profiles)
    ) THEN
      ALTER TABLE course_enrollments 
      ADD CONSTRAINT course_enrollments_enrolled_by_fkey 
      FOREIGN KEY (enrolled_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add foreign key from media_files to user_profiles - nullable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'media_files_uploaded_by_fkey'
    AND table_name = 'media_files'
  ) THEN
    -- Only add if all uploaded_by values are either null or exist in user_profiles
    IF NOT EXISTS (
      SELECT 1 FROM media_files 
      WHERE uploaded_by IS NOT NULL 
      AND uploaded_by NOT IN (SELECT id FROM user_profiles)
    ) THEN
      ALTER TABLE media_files 
      ADD CONSTRAINT media_files_uploaded_by_fkey 
      FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
