/*
# Retry: Unpublish old courses, expand level constraint, insert 17 new courses

Same as previous attempt but without the manual FTS update (fts is a generated column).
*/

-- 1. Expand level constraint
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_level_check;
ALTER TABLE courses ADD CONSTRAINT courses_level_check
  CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels'));

-- 2. Unpublish all existing courses
UPDATE courses SET published = false WHERE published = true;

-- 3. Insert new courses
DO $$
DECLARE
  v_beauty uuid;
  v_tattoo uuid;
  v_podiatry uuid;
  v_cross uuid;
BEGIN
  SELECT id INTO v_beauty FROM sectors WHERE slug = 'beauty-aesthetics';
  SELECT id INTO v_tattoo FROM sectors WHERE slug = 'tattoo-piercing';
  SELECT id INTO v_podiatry FROM sectors WHERE slug = 'podiatry';
  SELECT id INTO v_cross FROM sectors WHERE slug = 'cross-sector';

  -- Beauty & Aesthetics (6 courses)
  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Clinical Waste Management for Beauty Professionals',
     'clinical-waste-management-beauty-professionals',
     'If you run a beauty salon or aesthetics clinic, you are legally classified as a waste producer. That means you have a legal Duty of Care to classify, segregate, store, and dispose of your waste correctly. Getting it wrong can result in unlimited fines, closure, or prosecution. This course cuts through the confusion and gives you a clear, practical system for managing clinical waste in your business.',
     77, 147, '3 modules, approx. 2.5 hours, self-paced', 'All Levels',
     'Salon owners, clinic managers, aestheticians, beauty therapists, front-of-house staff',
     '[{"title":"Are You a Waste Producer? Understanding Your Legal Duties"},{"title":"The Colour-Code System: What Goes Where"},{"title":"Building Your Compliant Waste Management System"}]',
     v_beauty, true,
     'Clinical Waste Management for Beauty | Waste Institute',
     'Learn your legal Duty of Care as a beauty salon or aesthetics clinic. Classify, segregate, store and dispose of clinical waste correctly.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Sharps Safety and Disposal in Aesthetic Practices',
     'sharps-safety-disposal-aesthetic-practices',
     'Needlestick injuries are one of the most common and most preventable accidents in aesthetic practice. This course gives you a complete, practical system for handling, using, and disposing of sharps safely. You will learn how to choose the right sharps container, how to use it correctly, what to do if someone gets injured, and how to train your team.',
     67, 127, '2 modules, approx. 2 hours, self-paced', 'All Levels',
     'Injectable therapists, microblading artists, laser technicians, phlebotomists',
     '[{"title":"Safe Sharps Handling from Start to Finish"},{"title":"Choosing, Using, and Disposing of Sharps Containers"}]',
     v_beauty, true,
     'Sharps Safety for Aesthetic Practices | Waste Institute',
     'Prevent needlestick injuries in your aesthetic practice. Learn safe sharps handling, correct container use, and injury response protocols.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Infection Control and Waste Compliance for Salons & Clinics',
     'infection-control-waste-compliance-salons-clinics',
     'Infection control and waste management are two sides of the same coin. This course brings both together into one practical system. You will learn how to clean, disinfect, and sterilise equipment correctly, how to handle contaminated items, and how to link your infection control procedures directly to your waste disposal.',
     77, 147, '3 modules, approx. 2.5 hours, self-paced', 'All Levels',
     'Salon owners, clinic managers, aestheticians, hygiene leads',
     '[{"title":"The Principles of Infection Control in Beauty & Aesthetics"},{"title":"Linking Infection Control to Waste Disposal"},{"title":"Building Your Audit-Ready Hygiene & Waste Policy"}]',
     v_beauty, true,
     'Infection Control for Salons & Clinics | Waste Institute',
     'Combine infection control and waste management into one practical system. Learn cleaning, disinfection, sterilisation and audit-ready hygiene policies.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Safe Waste Protocols for Injectable Therapies (Botox, Fillers)',
     'safe-waste-protocols-injectable-therapies',
     'Injectable therapies produce a specific and highly regulated waste stream. This course is designed specifically for practitioners offering botulinum toxin, dermal fillers, and other injectables. You will learn the exact protocols for waste generated before, during, and after treatment.',
     87, 167, '3 modules, approx. 3 hours, self-paced', 'All Levels',
     'Aesthetic nurses, prescribers, injectable therapists, clinic owners',
     '[{"title":"The Injectable Waste Stream: What You Produce and Why It Matters"},{"title":"Correct Disposal of Injectable Waste"},{"title":"Documentation, Auditing, and Inspection Readiness"}]',
     v_beauty, true,
     'Safe Waste Protocols for Injectable Therapies | Waste Institute',
     'Master injectable waste protocols for Botox and fillers. Learn correct disposal, documentation and inspection readiness for aesthetic practices.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('The "What Bin Does It Go In?" Guide for Salons & Clinics',
     'what-bin-does-it-go-in-guide-salons-clinics',
     'This is the quick, practical, no-nonsense guide that answers the single most common question in every salon and clinic: "What bin does this go in?" Using real examples from a typical working day, this course takes you through every common item and tells you exactly where it belongs.',
     47, 97, '1 module, approx. 1 hour, self-paced', 'All Levels',
     'Front-of-house staff, salon assistants, junior therapists, new starters',
     '[{"title":"The What Bin Does It Go In Guide"}]',
     v_beauty, true,
     'What Bin Does It Go In? Guide for Salons | Waste Institute',
     'The quick practical guide answering the most common salon question: what bin does this go in? Real examples for front-of-house and new starters.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('How to Use GreenRegistry.org to Generate Your First ESG Report',
     'how-to-use-greenregistry-first-esg-report',
     'Clients are increasingly choosing businesses that can demonstrate their environmental credentials. This course shows you how to use GreenRegistry.org, the AI-powered ESG reporting tool, to measure, track, and report your salon or clinic''s environmental impact.',
     67, 127, '2 modules, approx. 2 hours, self-paced', 'All Levels',
     'Salon and clinic owners, practice managers, sustainability leads',
     '[{"title":"Why ESG Matters for Your Salon or Clinic"},{"title":"Generating Your First ESG Report with GreenRegistry.org"}]',
     v_beauty, true,
     'ESG Reporting for Beauty with GreenRegistry | Waste Institute',
     'Learn to use GreenRegistry.org to generate your first ESG report. Measure, track and showcase your salon or clinic environmental credentials.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  -- Tattoo & Piercing (4 courses)
  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Best Practice for Tattoo Studio Clinical Waste Setup',
     'best-practice-tattoo-studio-clinical-waste-setup',
     'Tattoo studios produce a unique mix of clinical, offensive, and general waste. This course gives you a complete, practical system for setting up your studio''s waste management from scratch or improving what you already have.',
     77, 147, '3 modules, approx. 2.5 hours, self-paced', 'All Levels',
     'Tattoo studio owners, studio managers, senior artists',
     '[{"title":"Understanding Your Studio Waste Streams"},{"title":"Setting Up Your Waste Stations"},{"title":"Working with Waste Carriers and Keeping Records"}]',
     v_tattoo, true,
     'Tattoo Studio Clinical Waste Setup | Waste Institute',
     'Set up your tattoo studio waste management from scratch. Learn waste stream classification, waste station setup, and waste carrier record-keeping.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Single-Use Equipment Safety: Needles, Inks, and Barriers',
     'single-use-equipment-safety-needles-inks-barriers',
     'Single-use equipment is the backbone of safe tattoo and piercing practice. This course covers the full lifecycle of single-use equipment: choosing it, using it safely, and disposing of it correctly.',
     67, 127, '2 modules, approx. 2 hours, self-paced', 'All Levels',
     'Tattoo artists, piercing professionals, studio owners',
     '[{"title":"Safe Use of Single-Use Equipment"},{"title":"Correct Disposal of Single-Use Equipment"}]',
     v_tattoo, true,
     'Single-Use Equipment Safety for Tattoo | Waste Institute',
     'Master single-use equipment safety in tattoo and piercing. Learn correct selection, safe use, and proper disposal of needles, inks, and barriers.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Cleaning & Disinfection Protocols for Piercing Aftercare',
     'cleaning-disinfection-protocols-piercing-aftercare',
     'This course covers the complete cleaning and disinfection protocols for piercing studios, including how to handle contaminated equipment, how to dispose of waste generated during piercing, and how to maintain a hygienic environment.',
     67, 127, '2 modules, approx. 2 hours, self-paced', 'All Levels',
     'Piercing professionals, studio owners, body modification practitioners',
     '[{"title":"Cleaning, Disinfection, and Sterilisation"},{"title":"Waste Management for Piercing Aftercare"}]',
     v_tattoo, true,
     'Cleaning & Disinfection for Piercing Studios | Waste Institute',
     'Complete cleaning and disinfection protocols for piercing studios. Learn equipment handling, waste disposal, and maintaining a hygienic environment.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Managing Hazardous Waste in Tattoo and Piercing Studios',
     'managing-hazardous-waste-tattoo-piercing-studios',
     'Tattoo and piercing studios produce hazardous waste that goes beyond needles and bloodied wipes. This course gives you a complete understanding of hazardous waste in your studio, how to classify it, how to store it, and how to dispose of it legally.',
     87, 167, '3 modules, approx. 3 hours, self-paced', 'All Levels',
     'Studio owners, managers, senior artists responsible for compliance',
     '[{"title":"Identifying Hazardous Waste in Your Studio"},{"title":"Safe Storage and Disposal of Hazardous Waste"},{"title":"Compliance, Auditing, and Inspection Readiness"}]',
     v_tattoo, true,
     'Hazardous Waste in Tattoo & Piercing Studios | Waste Institute',
     'Learn to classify, store, and legally dispose of hazardous waste in tattoo and piercing studios. Covers compliance, auditing, and inspection readiness.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  -- Podiatry (4 courses)
  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Clinical Waste Management for Podiatry Practitioners',
     'clinical-waste-management-podiatry-practitioners',
     'Podiatry is one of the highest-risk professions for clinical waste. This course gives you a complete, practical system for managing clinical waste in your podiatry practice, whether you work from a clinic or as a mobile practitioner.',
     77, 147, '3 modules, approx. 2.5 hours, self-paced', 'All Levels',
     'Podiatrists, chiropodists, foot health practitioners, clinic owners',
     '[{"title":"Your Legal Duties as a Podiatry Practitioner"},{"title":"The Colour-Code System for Podiatry"},{"title":"Building Your Compliant Waste Management System"}]',
     v_podiatry, true,
     'Clinical Waste Management for Podiatry | Waste Institute',
     'Manage clinical waste in your podiatry practice. Learn legal duties, colour-code segregation, and compliant waste systems for clinic and mobile practitioners.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Sharps Safety and Disposal for Podiatrists',
     'sharps-safety-disposal-podiatrists',
     'Podiatrists use sharps every day: scalpel blades, needles, nail nippers, and more. This course gives you a complete, practical system for handling, using, and disposing of sharps safely.',
     67, 127, '2 modules, approx. 2 hours, self-paced', 'All Levels',
     'Podiatrists, chiropodists, foot health practitioners who use sharps',
     '[{"title":"Safe Sharps Handling in Podiatry"},{"title":"Choosing, Using, and Disposing of Sharps Containers"}]',
     v_podiatry, true,
     'Sharps Safety for Podiatrists | Waste Institute',
     'Learn safe sharps handling and disposal for podiatry. Covers scalpel blades, needles, nail nippers, and correct sharps container use in practice.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Infection Control and Waste Compliance in Podiatry Practice',
     'infection-control-waste-compliance-podiatry',
     'Infection control and waste management are inseparable in podiatry. This course brings both together into one practical system, covering cleaning, disinfection, sterilisation, and correct waste disposal.',
     77, 147, '3 modules, approx. 2.5 hours, self-paced', 'All Levels',
     'Podiatrists, chiropodists, clinic managers, foot health practitioners',
     '[{"title":"The Principles of Infection Control in Podiatry"},{"title":"Linking Infection Control to Waste Disposal"},{"title":"Building Your Audit-Ready Hygiene & Waste Policy"}]',
     v_podiatry, true,
     'Infection Control for Podiatry Practice | Waste Institute',
     'Combine infection control and waste management in podiatry. Learn cleaning, disinfection, sterilisation and audit-ready hygiene policies for your practice.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Mobile Podiatry: Managing Waste Safely on the Go',
     'mobile-podiatry-managing-waste-safely',
     'Mobile podiatry brings unique waste management challenges. This course is designed specifically for mobile practitioners, covering portable waste systems, safe transport, and compliant disposal.',
     67, 127, '2 modules, approx. 2 hours, self-paced', 'All Levels',
     'Mobile podiatrists, domiciliary foot health practitioners',
     '[{"title":"Setting Up a Portable Waste System"},{"title":"Transport, Storage, and Disposal"}]',
     v_podiatry, true,
     'Mobile Podiatry Waste Management | Waste Institute',
     'Manage clinical waste as a mobile podiatrist. Learn portable waste systems, safe transport, and compliant disposal for domiciliary practice.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  -- Cross-Sector (3 courses)
  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Certificate in Healthcare Waste Management: Compliance, Auditing, and the HTM 07-01 Framework',
     'certificate-healthcare-waste-management-htm-07-01',
     'This comprehensive certificate course provides a deep dive into the essential regulations governing healthcare waste, with a specific focus on HTM 07-01. You will learn auditing techniques and how to prepare for inspections.',
     97, 197, '5 modules, approx. 4 hours, self-paced', 'All Levels',
     'Practice managers, clinic owners, compliance officers, senior practitioners',
     '[{"title":"The Legal Landscape of Healthcare Waste"},{"title":"Demystifying HTM 07-01"},{"title":"The Waste Hierarchy in Practice"},{"title":"Mastering the Internal Waste Audit"},{"title":"Preparing for External Inspection"}]',
     v_cross, true,
     'Healthcare Waste Management Certificate HTM 07-01',
     'Master healthcare waste compliance with HTM 07-01. Learn auditing techniques, waste hierarchy, and inspection preparation in this certificate course.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Practical Waste Segregation and Staff Training for Healthcare Environments',
     'practical-waste-segregation-staff-training',
     'This highly practical course is designed for you to become the in-house expert who trains your entire team. It focuses on the "how" of waste segregation, turning complex regulations into simple, memorable actions.',
     87, 167, '5 modules, approx. 3.5 hours, self-paced', 'All Levels',
     'Lead practitioners, clinic managers, senior artists, team trainers',
     '[{"title":"Building a Culture of Safety"},{"title":"The Art of Waste Segregation: A Visual Guide"},{"title":"Train the Trainer: Delivering Effective Waste Safety Sessions"},{"title":"Managing the Messy Stuff: Sharps, Spills, and Contaminated Items"},{"title":"Keeping Standards High: Ongoing Monitoring and Refresher Training"}]',
     v_cross, true,
     'Practical Waste Segregation & Staff Training | Waste Institute',
     'Become the in-house waste training expert. Learn practical segregation, train-the-trainer techniques, and ongoing monitoring for healthcare teams.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();

  INSERT INTO courses (title, slug, description, price, original_price, duration, level, target_audience, syllabus, sector_id, published, seo_title, seo_description)
  VALUES
    ('Data-Driven Sustainability: Optimising Waste Reporting and Resource Efficiency',
     'data-driven-sustainability-waste-reporting',
     'This strategic course moves beyond compliance to show you how to turn your waste data into a powerful tool for business improvement, cost savings, and credible ESG reporting using GreenRegistry.org.',
     87, 167, '5 modules, approx. 3.5 hours, self-paced', 'All Levels',
     'Business owners, practice managers, sustainability leads',
     '[{"title":"From Compliance to Strategy: The Business Case for Sustainability"},{"title":"Measuring Your Impact: Key Metrics for Waste and Resource Use"},{"title":"Hands-On with GreenRegistry.org: Automating Your ESG Reporting"},{"title":"From Data to Action: Identifying Opportunities for Resource Efficiency"},{"title":"Telling Your Sustainability Story"}]',
     v_cross, true,
     'Data-Driven Sustainability & Waste Reporting | Waste Institute',
     'Turn waste data into business value. Learn sustainability metrics, ESG reporting with GreenRegistry.org, and resource efficiency for your practice.')
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
      original_price = EXCLUDED.original_price, duration = EXCLUDED.duration, level = EXCLUDED.level,
      target_audience = EXCLUDED.target_audience, syllabus = EXCLUDED.syllabus, sector_id = EXCLUDED.sector_id,
      published = true, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
      deleted_at = NULL, updated_at = now();
END $$;

-- 4. Create modules for each new course
DO $$
DECLARE
  course_record RECORD;
  syllabus_items jsonb;
  module_index integer;
  module_title text;
BEGIN
  FOR course_record IN SELECT id, syllabus FROM courses WHERE published = true AND syllabus IS NOT NULL LOOP
    syllabus_items := course_record.syllabus::jsonb;
    module_index := 0;

    FOR module_title IN SELECT jsonb_array_elements_text(syllabus_items) LOOP
      module_index := module_index + 1;

      INSERT INTO modules (course_id, title, display_order)
      VALUES (course_record.id, module_title, module_index)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
