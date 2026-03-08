/*
  # Create Testimonials Table

  ## Overview
  This migration creates a testimonials table for storing student reviews and feedback.
  Admins can manage testimonials which will be displayed on the home and courses pages.

  ## New Table
  - `testimonials` - Student testimonials and reviews
    - `id` (uuid, primary key)
    - `student_name` (text) - Name of the student
    - `student_title` (text) - Title/role of the student (e.g., "Waste Management Director")
    - `student_image` (text) - URL to profile image
    - `rating` (integer) - Star rating from 1-5
    - `testimonial_text` (text) - The testimonial content
    - `course_id` (uuid, optional) - Link to specific course if applicable
    - `featured` (boolean) - Whether to show on homepage
    - `display_order` (integer) - Order of display
    - `published` (boolean) - Whether testimonial is published
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS
  - Public can view published testimonials
  - Super admins can manage all testimonials
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_title text DEFAULT '',
  student_image text DEFAULT '',
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  testimonial_text text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published testimonials are viewable by everyone"
  ON testimonials FOR SELECT
  USING (published = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  ));

CREATE POLICY "Super admins can manage testimonials"
  ON testimonials FOR ALL
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

-- Insert demo testimonials
INSERT INTO testimonials (student_name, student_title, student_image, rating, testimonial_text, featured, display_order, published) VALUES
(
  'Sarah Johnson',
  'Environmental Manager, GreenTech Solutions',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'The AI-Powered Waste Sorting course completely transformed how we approach recycling at our facility. The practical insights and real-world examples made it easy to implement the technologies immediately.',
  true,
  1,
  true
),
(
  'Michael Chen',
  'Operations Director, Metro Waste Services',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'Outstanding training on hazardous waste handling. The certification program was thorough and the instructors were knowledgeable. Our team feels much more confident in our safety procedures now.',
  true,
  2,
  true
),
(
  'Emily Rodriguez',
  'Sustainability Consultant',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'The Circular Economy Fundamentals course opened my eyes to new possibilities. I''ve been able to help three clients implement circular practices that have reduced their waste by over 60%.',
  true,
  3,
  true
),
(
  'David Thompson',
  'Facility Manager, Regional Recycling Center',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'Excellent course on modern recycling operations. The content was up-to-date with the latest technologies and the lessons were well-structured. Highly recommend for anyone in the industry.',
  true,
  4,
  true
),
(
  'Jennifer Lee',
  'Environmental Compliance Officer',
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'The regulatory compliance course was exactly what I needed. It covered all the EPA requirements in detail and provided practical checklists that I use daily in my work.',
  true,
  5,
  true
),
(
  'Robert Martinez',
  'Landfill Operations Supervisor',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200',
  4,
  'Great insights into modern landfill management practices. The course on gas collection systems helped us increase our energy recovery by 25%. Well worth the investment.',
  true,
  6,
  true
),
(
  'Amanda White',
  'Waste Reduction Coordinator, City of Portland',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'WasteInstitute courses are comprehensive and practical. I''ve completed three courses and each one has provided valuable knowledge I''ve applied directly to my municipal programs.',
  true,
  7,
  true
),
(
  'James Wilson',
  'Construction Project Manager',
  'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=200',
  5,
  'The Construction Waste Management course helped us achieve 80% waste diversion on our latest project. The ROI strategies alone paid for the course multiple times over.',
  true,
  8,
  true
);
