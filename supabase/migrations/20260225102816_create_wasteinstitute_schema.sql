/*
  # WasteInstitute Learning Platform - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for the WasteInstitute learning management system
  including user profiles, courses, news, CMS, SEO, media management, and form submissions.

  ## New Tables

  ### User & Profile Management
  - `user_profiles` - Extended user information beyond auth.users
    - `id` (uuid, references auth.users)
    - `full_name` (text)
    - `role` (text) - 'super_admin', 'admin', 'user'
    - `created_at` (timestamptz)

  ### Course Management
  - `sectors` - Course categories/sectors
    - `id` (uuid, primary key)
    - `name` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `icon` (text) - icon name or URL
    - `display_order` (integer)
    - `created_at` (timestamptz)

  - `courses` - Main courses table
    - `id` (uuid, primary key)
    - `title` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `featured_image` (text)
    - `sector_id` (uuid, references sectors)
    - `price` (numeric)
    - `duration` (text)
    - `level` (text)
    - `published` (boolean)
    - `seo_title` (text)
    - `seo_description` (text)
    - `seo_keywords` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `modules` - Course modules
    - `id` (uuid, primary key)
    - `course_id` (uuid, references courses)
    - `title` (text)
    - `description` (text)
    - `display_order` (integer)
    - `created_at` (timestamptz)

  - `lessons` - Individual lessons within modules
    - `id` (uuid, primary key)
    - `module_id` (uuid, references modules)
    - `title` (text)
    - `content` (text) - Markdown or HTML content
    - `video_url` (text) - YouTube/Vimeo embed URL
    - `resources` (jsonb) - Array of downloadable resources
    - `display_order` (integer)
    - `duration` (integer) - in minutes
    - `created_at` (timestamptz)

  ### Progress & Certificates
  - `user_progress` - Track lesson completion
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `lesson_id` (uuid, references lessons)
    - `completed` (boolean)
    - `completed_at` (timestamptz)

  - `certificates` - Generated certificates
    - `id` (uuid, primary key)
    - `certificate_id` (text, unique) - e.g., WI-2026-0001
    - `user_id` (uuid, references auth.users)
    - `course_id` (uuid, references courses)
    - `issued_date` (timestamptz)

  ### Content Management
  - `news_articles` - News and blog posts
    - `id` (uuid, primary key)
    - `title` (text)
    - `slug` (text, unique)
    - `excerpt` (text)
    - `content` (text)
    - `featured_image` (text)
    - `author_id` (uuid, references auth.users)
    - `published` (boolean)
    - `published_at` (timestamptz)
    - `seo_title` (text)
    - `seo_description` (text)
    - `seo_keywords` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `static_pages` - CMS for static pages (About, Contact, etc.)
    - `id` (uuid, primary key)
    - `title` (text)
    - `slug` (text, unique)
    - `content` (text)
    - `published` (boolean)
    - `seo_title` (text)
    - `seo_description` (text)
    - `seo_keywords` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Settings & Media
  - `seo_settings` - Global SEO settings
    - `id` (uuid, primary key)
    - `page` (text, unique) - 'homepage', 'courses', etc.
    - `title` (text)
    - `description` (text)
    - `keywords` (text)
    - `og_image` (text)

  - `media_uploads` - File management
    - `id` (uuid, primary key)
    - `filename` (text)
    - `file_path` (text)
    - `file_type` (text)
    - `file_size` (integer)
    - `uploaded_by` (uuid, references auth.users)
    - `created_at` (timestamptz)

  - `site_settings` - General site settings (logos, favicons, etc.)
    - `id` (uuid, primary key)
    - `key` (text, unique)
    - `value` (text)
    - `updated_at` (timestamptz)

  ### Form Submissions
  - `contact_submissions` - Contact form entries
    - `id` (uuid, primary key)
    - `name` (text)
    - `email` (text)
    - `subject` (text)
    - `message` (text)
    - `created_at` (timestamptz)

  - `registration_submissions` - Registration form entries
    - `id` (uuid, primary key)
    - `full_name` (text)
    - `email` (text)
    - `phone` (text)
    - `organization` (text)
    - `message` (text)
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Super admin can do everything
  - Users can view published content
  - Users can track their own progress
  - Public can view published courses and pages
*/

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Sectors
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sectors are viewable by everyone"
  ON sectors FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage sectors"
  ON sectors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  featured_image text DEFAULT '',
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  price numeric DEFAULT 0,
  duration text DEFAULT '',
  level text DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  published boolean DEFAULT false,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (published = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Super admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Modules
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules are viewable with their course"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND (courses.published = true OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('super_admin', 'admin')
      ))
    )
  );

CREATE POLICY "Super admins can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  video_url text DEFAULT '',
  resources jsonb DEFAULT '[]'::jsonb,
  display_order integer DEFAULT 0,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable with their module"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND (courses.published = true OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('super_admin', 'admin')
      ))
    )
  );

CREATE POLICY "Super admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  issued_date timestamptz DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can verify certificates"
  ON certificates FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- News Articles
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  featured_image text DEFAULT '',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone"
  ON news_articles FOR SELECT
  USING (published = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Super admins can manage articles"
  ON news_articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Static Pages
CREATE TABLE IF NOT EXISTS static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  published boolean DEFAULT false,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published pages are viewable by everyone"
  ON static_pages FOR SELECT
  USING (published = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Super admins can manage pages"
  ON static_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text UNIQUE NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  keywords text DEFAULT '',
  og_image text DEFAULT ''
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO settings are viewable by everyone"
  ON seo_settings FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage SEO settings"
  ON seo_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Media Uploads
CREATE TABLE IF NOT EXISTS media_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text DEFAULT '',
  file_size integer DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media uploads are viewable by everyone"
  ON media_uploads FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage media"
  ON media_uploads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Super admins can view contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Registration Submissions
CREATE TABLE IF NOT EXISTS registration_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  organization text DEFAULT '',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registration_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit registration form"
  ON registration_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Super admins can view registration submissions"
  ON registration_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'WasteInstitute'),
  ('header_logo', ''),
  ('footer_logo', ''),
  ('favicon', ''),
  ('primary_color', '#059669'),
  ('admin_email', 'ronchimbo@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- Insert default SEO settings
INSERT INTO seo_settings (page, title, description, keywords) VALUES
  ('homepage', 'WasteInstitute - Leading Waste Management Education', 'Start learning with leading waste management experts today. Professional courses and certifications.', 'waste management, education, courses, certification'),
  ('courses', 'Our Courses - WasteInstitute', 'Explore our comprehensive waste management courses', 'waste management courses, training, education'),
  ('news', 'News & Updates - WasteInstitute', 'Latest news and updates from WasteInstitute', 'waste management news, updates, articles')
ON CONFLICT (page) DO NOTHING;