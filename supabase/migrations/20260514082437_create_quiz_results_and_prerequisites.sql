/*
  # Create quiz results table and course prerequisites

  1. New Tables
    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK → auth.users)
      - `course_id` (uuid, FK → courses)
      - `module_index` (integer) - which module (0-4)
      - `score` (integer) - percentage score
      - `passed` (boolean)
      - `answers` (jsonb) - array of {question_index, selected, correct, is_correct}
      - `attempt_number` (integer)
      - `completed_at` (timestamptz)
    - `assessment_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK → auth.users)
      - `course_id` (uuid, FK → courses)
      - `score` (integer) - percentage score
      - `passed` (boolean)
      - `answers` (jsonb) - array of answers with correctness
      - `total_questions` (integer)
      - `correct_answers` (integer)
      - `time_taken_seconds` (integer)
      - `attempt_number` (integer)
      - `completed_at` (timestamptz)

  2. Modified Tables
    - `courses`
      - Add `prerequisites` (uuid[], array of course IDs)

  3. Security
    - Enable RLS on both new tables
    - Users can view/insert their own results
    - Admins can view all results

  4. Indexes
    - Composite indexes on (user_id, course_id) for both tables
    - Index on module_index for quiz_results
*/

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  attempt_number integer NOT NULL DEFAULT 1,
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'instructor')
    )
  );

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON quiz_results(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_module ON quiz_results(module_index);

-- Assessment results table
CREATE TABLE IF NOT EXISTS assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_questions integer NOT NULL DEFAULT 25,
  correct_answers integer NOT NULL DEFAULT 0,
  time_taken_seconds integer,
  attempt_number integer NOT NULL DEFAULT 1,
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessment results"
  ON assessment_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment results"
  ON assessment_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessment results"
  ON assessment_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'instructor')
    )
  );

CREATE INDEX IF NOT EXISTS idx_assessment_results_user_course ON assessment_results(user_id, course_id);

-- Add prerequisites column to courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'prerequisites'
  ) THEN
    ALTER TABLE courses ADD COLUMN prerequisites uuid[] DEFAULT '{}';
  END IF;
END $$;

-- Add revoked flag to certificates for anti-forgery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'revoked'
  ) THEN
    ALTER TABLE certificates ADD COLUMN revoked boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'revoked_at'
  ) THEN
    ALTER TABLE certificates ADD COLUMN revoked_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'revoked_reason'
  ) THEN
    ALTER TABLE certificates ADD COLUMN revoked_reason text;
  END IF;
END $$;
