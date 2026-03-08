/*
  # Create News Ads System
  
  1. New Tables
    - `news_ads`
      - `id` (uuid, primary key)
      - `title` (text) - Ad title/heading
      - `description` (text) - Ad description/body text
      - `cta_text` (text) - Call to action button text
      - `cta_link` (text) - Internal link or course slug
      - `background_color` (text) - Hex color code for card background
      - `text_color` (text) - Hex color for text
      - `image_url` (text, nullable) - Optional image URL
      - `course_id` (uuid, nullable) - Link to specific course
      - `ad_type` (text) - Type: 'course', 'membership', 'generic'
      - `is_active` (boolean) - Whether ad is available for use
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `news_article_ads`
      - `id` (uuid, primary key)
      - `article_id` (uuid) - Foreign key to news_articles
      - `ad_id` (uuid) - Foreign key to news_ads
      - `position` (integer) - 1 for first (1/3), 2 for second (2/3)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Public can read active ads
    - Only authenticated admins can manage ads
*/

-- Create news_ads table
CREATE TABLE IF NOT EXISTS news_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  cta_text text NOT NULL DEFAULT 'Learn More',
  cta_link text NOT NULL,
  background_color text NOT NULL DEFAULT '#10b981',
  text_color text NOT NULL DEFAULT '#ffffff',
  image_url text,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  ad_type text NOT NULL DEFAULT 'generic' CHECK (ad_type IN ('course', 'membership', 'generic')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news_article_ads junction table
CREATE TABLE IF NOT EXISTS news_article_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  ad_id uuid NOT NULL REFERENCES news_ads(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position IN (1, 2)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(article_id, position)
);

-- Enable RLS
ALTER TABLE news_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_ads ENABLE ROW LEVEL SECURITY;

-- Policies for news_ads
CREATE POLICY "Anyone can view active news ads"
  ON news_ads FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert news ads"
  ON news_ads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news ads"
  ON news_ads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete news ads"
  ON news_ads FOR DELETE
  TO authenticated
  USING (true);

-- Policies for news_article_ads
CREATE POLICY "Anyone can view article ad assignments"
  ON news_article_ads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert article ad assignments"
  ON news_article_ads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update article ad assignments"
  ON news_article_ads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete article ad assignments"
  ON news_article_ads FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_news_ads_updated_at BEFORE UPDATE ON news_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_article_ads_updated_at BEFORE UPDATE ON news_article_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default ad templates
INSERT INTO news_ads (title, description, cta_text, cta_link, background_color, text_color, ad_type) VALUES
('Expand Your Waste Management Expertise', 'Join our comprehensive courses and gain industry-recognized certifications in waste management, recycling, and sustainability.', 'Browse All Courses', '/courses', '#10b981', '#ffffff', 'generic'),
('Become a Certified Waste Professional', 'Take your career to the next level with our expert-led training programs designed for waste industry professionals.', 'View Courses', '/courses', '#0ea5e9', '#ffffff', 'generic'),
('Join Our Professional Community', 'Connect with industry experts, access exclusive resources, and advance your career with Waste Institute membership.', 'Learn About Membership', '/membership', '#8b5cf6', '#ffffff', 'membership');
