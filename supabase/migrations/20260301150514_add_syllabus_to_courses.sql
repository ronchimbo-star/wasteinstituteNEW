/*
  # Add Syllabus Column to Courses Table

  1. Changes
    - Add `syllabus` column to `courses` table to store structured course content
    - The syllabus will be stored as JSONB to allow flexible module and topic structures
    - Add `target_audience` column to store intended audience information
  
  2. Notes
    - Existing courses will have NULL syllabus initially
    - The JSONB format allows for nested modules and topics
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'syllabus'
  ) THEN
    ALTER TABLE courses ADD COLUMN syllabus jsonb DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE courses ADD COLUMN target_audience text DEFAULT NULL;
  END IF;
END $$;
