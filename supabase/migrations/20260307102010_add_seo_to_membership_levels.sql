/*
  # Add SEO fields to membership levels
  
  1. Changes
    - Add `meta_title` (text) - SEO page title
    - Add `meta_description` (text) - SEO meta description
    - Add `meta_keywords` (text) - SEO keywords
    - Add `page_content` (text) - Full page content for the membership level page
    
  2. Notes
    - These fields allow each membership level to have its own dedicated page with proper SEO
    - All fields are optional to maintain backward compatibility
*/

-- Add SEO fields to membership_levels table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_levels' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE membership_levels ADD COLUMN meta_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_levels' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE membership_levels ADD COLUMN meta_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_levels' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE membership_levels ADD COLUMN meta_keywords text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_levels' AND column_name = 'page_content'
  ) THEN
    ALTER TABLE membership_levels ADD COLUMN page_content text;
  END IF;
END $$;

-- Update existing membership levels with SEO data
UPDATE membership_levels SET
  meta_title = 'Student Membership - Free for Full-Time Students | Waste Institute',
  meta_description = 'Join as a Student member for free access to waste management resources, 20% course discounts, and career development support. For students enrolled in related full-time courses.',
  meta_keywords = 'student membership, waste management student, free membership, student discount, environmental studies',
  page_content = description || E'\n\n' || criteria || E'\n\n' || benefits
WHERE slug = 'student';

UPDATE membership_levels SET
  meta_title = 'Affiliate Membership - Entry Level Professional Membership | Waste Institute',
  meta_description = 'Start your professional journey with Affiliate membership at £97/year. Perfect for those new to waste management with no formal qualifications required. Get 10% course discounts.',
  meta_keywords = 'affiliate membership, entry level membership, waste management professional, clinical waste basics',
  page_content = description || E'\n\n' || criteria || E'\n\n' || benefits
WHERE slug = 'affiliate';

UPDATE membership_levels SET
  meta_title = 'Associate Membership (AssocIW) - Professional Recognition | Waste Institute',
  meta_description = 'Gain the prestigious AssocIW designation with Associate membership. For professionals with 2+ years experience or Level 3 qualifications. £147/year with 15% course discounts.',
  meta_keywords = 'AssocIW, associate membership, professional recognition, waste management qualification, post nominals',
  page_content = description || E'\n\n' || criteria || E'\n\n' || benefits
WHERE slug = 'associate';

UPDATE membership_levels SET
  meta_title = 'Technical Membership (TechIW) - Specialist Recognition | Waste Institute',
  meta_description = 'Join as a Technical member (TechIW) for advanced resources and expert support. For operational specialists and managers with Level 4+ qualifications. £197/year, 25% course discounts.',
  meta_keywords = 'TechIW, technical membership, waste management specialist, technical expert, clinic manager',
  page_content = description || E'\n\n' || criteria || E'\n\n' || benefits
WHERE slug = 'technical';

UPDATE membership_levels SET
  meta_title = 'Chartered Membership (CIWM) - Industry Leader Recognition | Waste Institute',
  meta_description = 'Achieve Chartered status (CIWM) as an industry leader. For senior professionals with 5+ years management experience and certification. £297/year with exclusive benefits.',
  meta_keywords = 'CIWM, chartered membership, industry leader, senior professional, waste management expert, chartered member',
  page_content = description || E'\n\n' || criteria || E'\n\n' || benefits
WHERE slug = 'chartered';

UPDATE membership_levels SET
  meta_title = 'Fellow Membership (FIWM) - Highest Honor | Waste Institute',
  meta_description = 'The pinnacle of professional recognition. Fellowship (FIWM) is awarded to outstanding professionals who have made exceptional contributions to waste management. Invitation-only.',
  meta_keywords = 'FIWM, fellowship, fellow membership, highest honor, thought leader, industry pioneer',
  page_content = description || E'\n\n' || criteria || E'\n\n' || benefits
WHERE slug = 'fellow';
