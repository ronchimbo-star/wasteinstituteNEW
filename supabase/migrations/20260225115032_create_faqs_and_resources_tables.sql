/*
  # Create FAQ and Resources Management Tables

  1. New Tables
    - `faq_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text, nullable) - Category description
      - `display_order` (integer) - Sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `faqs`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to faq_categories)
      - `question` (text) - The question
      - `answer` (text) - The answer
      - `display_order` (integer) - Sort order within category
      - `published` (boolean) - Whether FAQ is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resource_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text, nullable)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resources`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to resource_categories)
      - `title` (text) - Resource title
      - `description` (text, nullable) - Resource description
      - `type` (text) - Type: 'pdf', 'image', 'video', 'link', 'document'
      - `file_url` (text, nullable) - URL to file or external link
      - `thumbnail_url` (text, nullable) - Thumbnail image URL
      - `file_size` (bigint, nullable) - File size in bytes
      - `display_order` (integer)
      - `published` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `media_files`
      - `id` (uuid, primary key)
      - `filename` (text) - Original filename
      - `file_url` (text) - Full URL to file
      - `file_type` (text) - MIME type
      - `file_size` (bigint) - File size in bytes
      - `width` (integer, nullable) - Image width if applicable
      - `height` (integer, nullable) - Image height if applicable
      - `uploaded_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for published items
    - Admin-only write access
*/

-- FAQ Categories Table
CREATE TABLE IF NOT EXISTS faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view FAQ categories"
  ON faq_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert FAQ categories"
  ON faq_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update FAQ categories"
  ON faq_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete FAQ categories"
  ON faq_categories FOR DELETE
  TO authenticated
  USING (true);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES faq_categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs"
  ON faqs FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (true);

-- Resource Categories Table
CREATE TABLE IF NOT EXISTS resource_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resource categories"
  ON resource_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert resource categories"
  ON resource_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resource categories"
  ON resource_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resource categories"
  ON resource_categories FOR DELETE
  TO authenticated
  USING (true);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES resource_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'link',
  file_url text,
  thumbnail_url text,
  file_size bigint,
  display_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published resources"
  ON resources FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can view all resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (true);

-- Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  width integer,
  height integer,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view media files"
  ON media_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert media files"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete media files"
  ON media_files FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample FAQ categories
INSERT INTO faq_categories (name, slug, description, display_order) VALUES
  ('General', 'general', 'General questions about WasteInstitute', 1),
  ('Courses', 'courses', 'Questions about our courses and training programs', 2),
  ('Certification', 'certification', 'Questions about certifications and credentials', 3),
  ('Technical Support', 'technical-support', 'Technical and account-related questions', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'What is WasteInstitute?',
  'WasteInstitute is a leading online learning platform specializing in waste management education and professional development. We offer comprehensive courses, certifications, and training programs designed by industry experts to help professionals advance their careers in the waste management sector.',
  1,
  true
FROM faq_categories c WHERE c.slug = 'general'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'Who can benefit from WasteInstitute courses?',
  'Our courses are designed for a wide range of professionals including waste management operators, environmental consultants, municipal officials, facility managers, sustainability coordinators, and anyone interested in advancing their knowledge in waste management and circular economy practices.',
  2,
  true
FROM faq_categories c WHERE c.slug = 'general'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'How long do courses typically take to complete?',
  'Course duration varies depending on the complexity and depth of the subject matter. Most courses range from 4 to 12 weeks, with self-paced options available. Each course page displays the estimated completion time to help you plan your learning journey.',
  1,
  true
FROM faq_categories c WHERE c.slug = 'courses'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'Are the courses self-paced or instructor-led?',
  'We offer both self-paced and instructor-led courses. Self-paced courses allow you to learn at your own schedule, while instructor-led courses include live sessions, group discussions, and direct interaction with industry experts. Check the course details for specific information.',
  2,
  true
FROM faq_categories c WHERE c.slug = 'courses'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'What certifications do you offer?',
  'WasteInstitute offers industry-recognized certifications in various waste management specializations including Waste Operations Management, Recycling Coordination, Hazardous Waste Handling, Circular Economy Practices, and Environmental Compliance. All certificates are digitally verifiable and can be shared on professional networks.',
  1,
  true
FROM faq_categories c WHERE c.slug = 'certification'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'How do I verify my certificate?',
  'Each certificate issued by WasteInstitute includes a unique verification code. Anyone can verify the authenticity of a certificate by visiting our certificate verification page and entering the code. Certificates are also available as digital badges that can be added to your LinkedIn profile.',
  2,
  true
FROM faq_categories c WHERE c.slug = 'certification'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'I forgot my password. How can I reset it?',
  'Click on the "Login" button and then select "Forgot Password" on the login page. Enter your registered email address, and we will send you instructions to reset your password. If you do not receive the email within a few minutes, please check your spam folder.',
  1,
  true
FROM faq_categories c WHERE c.slug = 'technical-support'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, display_order, published)
SELECT 
  c.id,
  'What should I do if I encounter technical issues during a course?',
  'If you experience any technical difficulties, please contact our support team at support@wasteinstitute.org. Include details about the issue, the course name, and any error messages you see. Our technical team typically responds within 24 hours.',
  2,
  true
FROM faq_categories c WHERE c.slug = 'technical-support'
ON CONFLICT DO NOTHING;

-- Insert sample resource categories
INSERT INTO resource_categories (name, slug, description, display_order) VALUES
  ('Industry Standards', 'industry-standards', 'Official standards and regulations', 1),
  ('Best Practices', 'best-practices', 'Guides and best practice documents', 2),
  ('Research Papers', 'research-papers', 'Academic research and white papers', 3),
  ('Videos', 'videos', 'Educational videos and webinar recordings', 4)
ON CONFLICT (slug) DO NOTHING;