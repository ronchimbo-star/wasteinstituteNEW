/*
  # Fix Foreign Keys to User Profiles

  1. Changes
    - Drop incorrect foreign keys pointing to non-existent 'users' table
    - Create correct foreign keys pointing to 'user_profiles' table
  
  2. Tables Updated
    - certificates: user_id -> user_profiles.id
    - course_enrollments: user_id -> user_profiles.id
    - course_enrollments: enrolled_by -> user_profiles.id
  
  3. Notes
    - Previous migration incorrectly created FKs to 'users' instead of 'user_profiles'
    - This migration corrects the references
*/

-- Drop incorrect foreign keys
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_user_id_fkey;
ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_user_id_fkey;
ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_enrolled_by_fkey;

-- Create correct foreign keys pointing to user_profiles
ALTER TABLE certificates 
ADD CONSTRAINT certificates_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE course_enrollments 
ADD CONSTRAINT course_enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE course_enrollments 
ADD CONSTRAINT course_enrollments_enrolled_by_fkey 
FOREIGN KEY (enrolled_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
