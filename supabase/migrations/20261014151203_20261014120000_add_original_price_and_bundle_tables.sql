/*
# Add original_price column and course bundle tables

## Overview
This migration supports the repositioning of Waste Institute as MediWaste's training arm.
It adds an original_price column to courses for was/now pricing display, and creates
a course_bundles table plus a bundle_courses join table to support bundle offers.

## Changes

### 1. courses table - new column
- `original_price` (numeric, nullable) - the crossed-out "was" price shown on course cards.
  When NULL, no original price is displayed. When set, the course card shows both the
  current price and the original price with a strikethrough.

### 2. New table: course_bundles
Stores bundle offers that group multiple courses at a discounted price.
- `id` (uuid, primary key)
- `name` (text, not null) - display name of the bundle
- `slug` (text, unique, not null) - URL-friendly identifier
- `description` (text) - marketing description
- `bundle_price` (numeric, not null) - the discounted bundle price
- `individual_total` (numeric, not null) - sum of individual course prices
- `saving_amount` (numeric, not null) - how much the buyer saves
- `target_audience` (text) - who the bundle is for
- `sector_id` (uuid, references sectors) - which sector the bundle belongs to (nullable for cross-sector)
- `published` (boolean, default false)
- `display_order` (integer, default 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 3. New table: bundle_courses
Join table linking bundles to their constituent courses.
- `id` (uuid, primary key)
- `bundle_id` (uuid, references course_bundles ON DELETE CASCADE)
- `course_id` (uuid, references courses ON DELETE CASCADE)
- `display_order` (integer, default 0)
- UNIQUE(bundle_id, course_id)

## Security
- RLS enabled on both new tables.
- Public (anon + authenticated) can read published bundles and their course relationships.
- Only super_admin can insert/update/delete bundles and bundle_courses.
*/

-- 1. Add original_price column to courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE courses ADD COLUMN original_price numeric;
  END IF;
END $$;

-- 2. Create course_bundles table
CREATE TABLE IF NOT EXISTS course_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  bundle_price numeric NOT NULL DEFAULT 0,
  individual_total numeric NOT NULL DEFAULT 0,
  saving_amount numeric NOT NULL DEFAULT 0,
  target_audience text DEFAULT '',
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE course_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published bundles are viewable by everyone" ON course_bundles;
CREATE POLICY "Published bundles are viewable by everyone"
  ON course_bundles FOR SELECT
  TO anon, authenticated
  USING (published = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  ));

DROP POLICY IF EXISTS "Admins can manage bundles" ON course_bundles;
CREATE POLICY "Admins can manage bundles"
  ON course_bundles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- 3. Create bundle_courses join table
CREATE TABLE IF NOT EXISTS bundle_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES course_bundles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  UNIQUE(bundle_id, course_id)
);

ALTER TABLE bundle_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bundle courses viewable by everyone" ON bundle_courses;
CREATE POLICY "Bundle courses viewable by everyone"
  ON bundle_courses FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_bundles
      WHERE course_bundles.id = bundle_courses.bundle_id
      AND (course_bundles.published = true OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('super_admin', 'admin')
      ))
    )
  );

DROP POLICY IF EXISTS "Admins can manage bundle courses" ON bundle_courses;
CREATE POLICY "Admins can manage bundle courses"
  ON bundle_courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- 4. Add index for bundle lookups
CREATE INDEX IF NOT EXISTS idx_bundle_courses_bundle_id ON bundle_courses(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_courses_course_id ON bundle_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_bundles_sector_id ON course_bundles(sector_id);
CREATE INDEX IF NOT EXISTS idx_course_bundles_published ON course_bundles(published) WHERE published = true;
