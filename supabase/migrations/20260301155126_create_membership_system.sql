/*
  # Create Membership System for Waste Institute

  1. New Tables
    - `membership_levels`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "Student", "Affiliate", "Associate"
      - `slug` (text, unique) - URL-friendly version
      - `post_nominals` (text) - e.g., "AssocIW", "TechIW", "CIWM"
      - `description` (text) - Full description of the level
      - `criteria` (text) - Requirements to join
      - `benefits` (text) - What members receive
      - `annual_fee` (decimal) - Yearly fee in GBP
      - `quarterly_fee` (decimal) - Optional quarterly payment
      - `monthly_fee` (decimal) - Optional monthly payment
      - `display_order` (integer) - Order to display levels
      - `is_invitation_only` (boolean) - For Fellow level
      - `course_discount_percent` (integer) - Discount on courses
      - `published` (boolean) - Show publicly
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `membership_level_id` (uuid, foreign key to membership_levels)
      - `status` (text) - active, expired, cancelled, pending
      - `start_date` (date)
      - `end_date` (date)
      - `payment_frequency` (text) - annual, quarterly, monthly
      - `auto_renew` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read published membership levels
    - Users can read their own memberships
    - Only admins can manage memberships

  3. Seed Data
    - Create all membership levels from Student to Fellow
*/

-- Create membership_levels table
CREATE TABLE IF NOT EXISTS membership_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  post_nominals text,
  description text NOT NULL,
  criteria text NOT NULL,
  benefits text NOT NULL,
  annual_fee decimal(10,2) NOT NULL DEFAULT 0,
  quarterly_fee decimal(10,2),
  monthly_fee decimal(10,2),
  display_order integer NOT NULL DEFAULT 0,
  is_invitation_only boolean DEFAULT false,
  course_discount_percent integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_memberships table
CREATE TABLE IF NOT EXISTS user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  membership_level_id uuid NOT NULL REFERENCES membership_levels(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  start_date date,
  end_date date,
  payment_frequency text,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  CONSTRAINT valid_payment_frequency CHECK (payment_frequency IN ('annual', 'quarterly', 'monthly'))
);

-- Enable RLS
ALTER TABLE membership_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- Membership levels policies
CREATE POLICY "Anyone can view published membership levels"
  ON membership_levels FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage membership levels"
  ON membership_levels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- User memberships policies
CREATE POLICY "Users can view own memberships"
  ON user_memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all memberships"
  ON user_memberships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage memberships"
  ON user_memberships FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Insert membership levels
INSERT INTO membership_levels (name, slug, post_nominals, description, criteria, benefits, annual_fee, quarterly_fee, monthly_fee, display_order, course_discount_percent, is_invitation_only) VALUES
(
  'Student',
  'student',
  NULL,
  'Designed for individuals currently enrolled in full-time beauty, aesthetics, nursing, or environmental courses. This complimentary membership provides essential resources and support to help you succeed in your studies and prepare for a career in the waste management sector.',
  'Must be enrolled in a full-time accredited course related to beauty, aesthetics, healthcare, or environmental studies. Proof of enrollment required (student ID or letter from institution).',
  '• Access to the member-only forum and community
• Monthly student newsletter with exam tips, industry news, and career guidance
• 20% discount on all Waste Institute certificate courses
• Access to student-focused webinars and study resources
• Career advice and mentoring opportunities',
  0.00,
  NULL,
  NULL,
  1,
  20,
  false
),
(
  'Affiliate',
  'affiliate',
  NULL,
  'The entry point to professional membership. Perfect for front-of-house staff, receptionists, salon assistants, or anyone new to the industry who wants to understand clinical waste management basics. No formal qualifications required—just a commitment to learning and professional development.',
  'Open to anyone working in or interested in the healthcare, beauty, aesthetics, or waste management sectors. No formal qualifications required.',
  '• Weekly member newsletter with regulatory updates and sector news
• Full access to the member-only forum and networking opportunities
• 10% discount on all Waste Institute courses
• Access to "Clinical Waste Basics" quick-reference guide (PDF)
• Invitations to member events and webinars
• Recognition as a professional member of the Waste Institute',
  97.00,
  33.00,
  NULL,
  2,
  10,
  false
),
(
  'Associate',
  'associate',
  'AssocIW',
  'Designed for practicing professionals who have demonstrated commitment to their career development. Associate membership recognizes your experience and provides enhanced resources, networking opportunities, and the prestigious AssocIW post-nominal designation.',
  'Requires EITHER: 2+ years of industry experience in healthcare, beauty, aesthetics, or clinical waste management OR a Level 3 qualification (e.g., NVQ, BTEC in Beauty/Hairdressing, Diploma in Healthcare).',
  '• All Affiliate benefits included
• Post-nominal designation: AssocIW (Associate of the Waste Institute)
• Access to exclusive Associate-only quarterly webinars
• 15% discount on all Waste Institute courses
• Official Waste Institute Associate digital badge for email signatures and LinkedIn
• Priority booking for events and training
• Access to member directory for professional networking
• Recognition as an established professional in the field',
  147.00,
  38.00,
  13.00,
  3,
  15,
  false
),
(
  'Technical',
  'technical',
  'TechIW',
  'For operational specialists, lead aestheticians, clinic managers, and technical experts with significant practical experience. Technical membership recognizes advanced competence and provides access to exclusive technical resources, priority support, and the respected TechIW post-nominal designation.',
  'Requires EITHER: A Level 4 qualification or higher (e.g., HNC, Foundation Degree, relevant degree) OR 2+ years experience PLUS a relevant Level 3 qualification. Must demonstrate operational or technical expertise.',
  '• All Associate benefits included
• Post-nominal designation: TechIW (Technical Member of the Waste Institute)
• Full access to the Waste Institute Knowledge Centre with technical briefings and guidance documents
• Library of recorded deep-dive technical webinars
• Priority access to technical advice from the Waste Institute expert team
• 25% discount on all Waste Institute courses
• Opportunity to contribute articles to member publications
• Enhanced digital badge showing Technical membership status
• Recognition as a technical specialist in clinical waste management',
  197.00,
  50.00,
  17.00,
  4,
  25,
  false
),
(
  'Chartered',
  'chartered',
  'CIWM',
  'The pinnacle of professional recognition for experienced leaders in the field. Chartered membership is awarded to senior professionals who have demonstrated exceptional competence, extensive experience, and commitment to continuous professional development. This prestigious grade establishes you as an industry expert.',
  'Requires 5+ years in a senior or management role (e.g., clinic owner, compliance manager, head of operations) AND successful completion of at least two Waste Institute certificate courses (such as the HTM 07-01 Framework and Auditing courses).',
  '• All Technical benefits included
• Post-nominal designation: CIWM (Chartered Member of the Waste Institute)
• Invitation to the exclusive annual Chartered Leaders networking event
• Opportunity to contribute to Waste Institute guidance documents and policy
• Featured recognition in member communications and publications
• Enhanced digital badge showing Chartered status
• Priority speaker opportunities at Waste Institute events
• 35% discount on all Waste Institute courses
• Access to Chartered-only peer support network
• Recognition as an industry leader and expert authority',
  297.00,
  75.00,
  25.00,
  5,
  35,
  false
),
(
  'Fellow',
  'fellow',
  'FIWM',
  'The highest honor bestowed by the Waste Institute. Fellowship is awarded by invitation or application to outstanding professionals who have made significant and sustained contributions to the waste management sector through thought leadership, innovation, research, or exceptional service to the profession.',
  'Invitation-only or application-based. Requires demonstrated exceptional contribution to the sector through one or more of: pioneering research, significant innovation, influential thought leadership, extensive voluntary work, or outstanding service to the profession. Typically 10+ years senior experience.',
  '• All Chartered benefits included
• Post-nominal designation: FIWM (Fellow of the Waste Institute)
• Highest level of professional recognition in the sector
• Invitation to serve on the Waste Institute advisory panel
• Free access to all Waste Institute courses and events
• Priority speaking opportunities at major industry conferences
• Featured profile in the Fellows directory
• Opportunity to mentor the next generation of professionals
• Recognition and certificate presented at annual ceremony
• Lifetime achievement recognition within the professional community',
  347.00,
  NULL,
  NULL,
  6,
  100,
  true
);
