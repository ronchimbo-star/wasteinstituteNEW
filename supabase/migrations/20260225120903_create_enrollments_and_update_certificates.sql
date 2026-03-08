/*
  # Create Course Enrollments and Update Certificates System

  1. New Tables
    - `course_enrollments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - The enrolled student
      - `course_id` (uuid, foreign key to courses) - The enrolled course
      - `enrolled_by` (uuid, foreign key to auth.users) - Admin who assigned the course
      - `status` (text) - enrolled, in_progress, completed
      - `progress` (integer) - Percentage of course completion (0-100)
      - `enrolled_at` (timestamptz) - When the enrollment was created
      - `completed_at` (timestamptz, nullable) - When course was completed
      - `created_at` (timestamptz)

  2. Modified Tables
    - `certificates`
      - Add `verification_code` (text, unique) - Unique code for certificate verification
      - Add `student_name` (text) - Student's full name
      - Add `enrollment_id` (uuid, foreign key) - Link to enrollment record

  3. Security
    - Enable RLS on `course_enrollments` table
    - Students can view their own enrollments
    - Admins can manage all enrollments
    - Public can verify certificates by verification code

  4. Important Notes
    - Enrollments track which students are assigned to which courses
    - Certificates are generated when a course is marked as completed
    - Verification codes are auto-generated unique identifiers
*/

-- Course Enrollments Table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments"
  ON course_enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON course_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert enrollments"
  ON course_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update enrollments"
  ON course_enrollments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete enrollments"
  ON course_enrollments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Update Certificates Table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'verification_code'
  ) THEN
    ALTER TABLE certificates ADD COLUMN verification_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'student_name'
  ) THEN
    ALTER TABLE certificates ADD COLUMN student_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'enrollment_id'
  ) THEN
    ALTER TABLE certificates ADD COLUMN enrollment_id uuid REFERENCES course_enrollments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update certificate policies to allow public verification
DROP POLICY IF EXISTS "Anyone can view certificates by verification code" ON certificates;

CREATE POLICY "Anyone can view certificates by verification code"
  ON certificates FOR SELECT
  TO public
  USING (verification_code IS NOT NULL);

-- Create index on verification_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

-- Create index on enrollments for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);