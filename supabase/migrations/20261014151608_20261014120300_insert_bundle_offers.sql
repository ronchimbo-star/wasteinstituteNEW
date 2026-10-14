/*
# Insert 12 bundle offers with course relationships

## Overview
Inserts all 12 bundle offers from the MediWaste course catalogue, linking each bundle
to its constituent courses via the bundle_courses join table.

## New Data
12 bundles across 4 sectors:
- Beauty: 4 bundles (Compliance Essentials, Injectable Complete, Business & Sustainability, Complete Collection)
- Tattoo: 3 bundles (Compliance Essentials, Advanced Compliance, Complete Collection)
- Podiatry: 3 bundles (Compliance Essentials, Mobile Complete, Complete Collection)
- Cross-Sector: 2 bundles (Compliance Certificate, Complete Professional)

## Security
No security changes — RLS already enabled on course_bundles and bundle_courses.
*/

DO $$
DECLARE
  v_beauty uuid;
  v_tattoo uuid;
  v_podiatry uuid;
  v_cross uuid;
  v_bundle_id uuid;
  c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; c6 uuid; -- beauty courses
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; -- tattoo courses
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; -- podiatry courses
  x1 uuid; x2 uuid; x3 uuid; -- cross-sector courses
BEGIN
  SELECT id INTO v_beauty FROM sectors WHERE slug = 'beauty-aesthetics';
  SELECT id INTO v_tattoo FROM sectors WHERE slug = 'tattoo-piercing';
  SELECT id INTO v_podiatry FROM sectors WHERE slug = 'podiatry';
  SELECT id INTO v_cross FROM sectors WHERE slug = 'cross-sector';

  -- Look up all course IDs by slug
  SELECT id INTO c1 FROM courses WHERE slug = 'clinical-waste-management-beauty-professionals';
  SELECT id INTO c2 FROM courses WHERE slug = 'sharps-safety-disposal-aesthetic-practices';
  SELECT id INTO c3 FROM courses WHERE slug = 'infection-control-waste-compliance-salons-clinics';
  SELECT id INTO c4 FROM courses WHERE slug = 'safe-waste-protocols-injectable-therapies';
  SELECT id INTO c5 FROM courses WHERE slug = 'what-bin-does-it-go-in-guide-salons-clinics';
  SELECT id INTO c6 FROM courses WHERE slug = 'how-to-use-greenregistry-first-esg-report';

  SELECT id INTO t1 FROM courses WHERE slug = 'best-practice-tattoo-studio-clinical-waste-setup';
  SELECT id INTO t2 FROM courses WHERE slug = 'single-use-equipment-safety-needles-inks-barriers';
  SELECT id INTO t3 FROM courses WHERE slug = 'cleaning-disinfection-protocols-piercing-aftercare';
  SELECT id INTO t4 FROM courses WHERE slug = 'managing-hazardous-waste-tattoo-piercing-studios';

  SELECT id INTO p1 FROM courses WHERE slug = 'clinical-waste-management-podiatry-practitioners';
  SELECT id INTO p2 FROM courses WHERE slug = 'sharps-safety-disposal-podiatrists';
  SELECT id INTO p3 FROM courses WHERE slug = 'infection-control-waste-compliance-podiatry';
  SELECT id INTO p4 FROM courses WHERE slug = 'mobile-podiatry-managing-waste-safely';

  SELECT id INTO x1 FROM courses WHERE slug = 'certificate-healthcare-waste-management-htm-07-01';
  SELECT id INTO x2 FROM courses WHERE slug = 'practical-waste-segregation-staff-training';
  SELECT id INTO x3 FROM courses WHERE slug = 'data-driven-sustainability-waste-reporting';

  -- 1. Beauty Compliance Essentials
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Beauty Compliance Essentials', 'beauty-compliance-essentials',
    'Three essential courses covering clinical waste, sharps safety, and infection control for beauty and aesthetics professionals.',
    177, 221, 44, 'Salon owners, clinic managers, aestheticians', v_beauty, true, 1)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, c1, 1), (v_bundle_id, c2, 2), (v_bundle_id, c3, 3) ON CONFLICT DO NOTHING;

  -- 2. Injectable Therapies Complete
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Injectable Therapies Complete', 'injectable-therapies-complete',
    'Complete waste management training for injectable therapies: sharps safety, injectable waste protocols, and the quick segregation guide.',
    157, 201, 44, 'Injectable therapists, aesthetic nurses, prescribers', v_beauty, true, 2)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, c2, 1), (v_bundle_id, c4, 2), (v_bundle_id, c5, 3) ON CONFLICT DO NOTHING;

  -- 3. Beauty Business & Sustainability
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Beauty Business & Sustainability', 'beauty-business-sustainability',
    'Clinical waste management plus ESG reporting with GreenRegistry.org — for salons and clinics that want to stand out.',
    117, 144, 27, 'Salon owners, clinic owners, practice managers', v_beauty, true, 3)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, c1, 1), (v_bundle_id, c6, 2) ON CONFLICT DO NOTHING;

  -- 4. Beauty Complete Collection
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Beauty Complete Collection', 'beauty-complete-collection',
    'All 6 Beauty & Aesthetics courses in one complete package. Save £125 on individual prices.',
    297, 422, 125, 'All beauty and aesthetics professionals', v_beauty, true, 4)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, c1, 1), (v_bundle_id, c2, 2), (v_bundle_id, c3, 3), (v_bundle_id, c4, 4), (v_bundle_id, c5, 5), (v_bundle_id, c6, 6) ON CONFLICT DO NOTHING;

  -- 5. Tattoo Studio Compliance Essentials
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Tattoo Studio Compliance Essentials', 'tattoo-studio-compliance-essentials',
    'Three essential courses for tattoo and piercing studios: clinical waste setup, single-use equipment safety, and piercing aftercare.',
    167, 211, 44, 'Tattoo studio owners, managers, senior artists', v_tattoo, true, 5)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, t1, 1), (v_bundle_id, t2, 2), (v_bundle_id, t3, 3) ON CONFLICT DO NOTHING;

  -- 6. Tattoo Studio Advanced Compliance
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Tattoo Studio Advanced Compliance', 'tattoo-studio-advanced-compliance',
    'Clinical waste setup plus hazardous waste management for studios that need advanced compliance.',
    137, 164, 27, 'Studio owners, managers responsible for compliance', v_tattoo, true, 6)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, t1, 1), (v_bundle_id, t4, 2) ON CONFLICT DO NOTHING;

  -- 7. Tattoo Complete Collection
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Tattoo Complete Collection', 'tattoo-complete-collection',
    'All 4 Tattoo & Piercing courses in one complete package. Save £71 on individual prices.',
    227, 298, 71, 'All tattoo and piercing professionals', v_tattoo, true, 7)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, t1, 1), (v_bundle_id, t2, 2), (v_bundle_id, t3, 3), (v_bundle_id, t4, 4) ON CONFLICT DO NOTHING;

  -- 8. Podiatry Compliance Essentials
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Podiatry Compliance Essentials', 'podiatry-compliance-essentials',
    'Three essential courses covering clinical waste, sharps safety, and infection control for podiatry practitioners.',
    177, 221, 44, 'Podiatrists, chiropodists, foot health practitioners', v_podiatry, true, 8)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, p1, 1), (v_bundle_id, p2, 2), (v_bundle_id, p3, 3) ON CONFLICT DO NOTHING;

  -- 9. Mobile Podiatry Complete
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Mobile Podiatry Complete', 'mobile-podiatry-complete',
    'Everything a mobile podiatrist needs: clinical waste management, sharps safety, and mobile waste management.',
    167, 211, 44, 'Mobile podiatrists, domiciliary practitioners', v_podiatry, true, 9)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, p1, 1), (v_bundle_id, p2, 2), (v_bundle_id, p4, 3) ON CONFLICT DO NOTHING;

  -- 10. Podiatry Complete Collection
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Podiatry Complete Collection', 'podiatry-complete-collection',
    'All 4 Podiatry courses in one complete package. Save £61 on individual prices.',
    227, 288, 61, 'All podiatry professionals', v_podiatry, true, 10)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, p1, 1), (v_bundle_id, p2, 2), (v_bundle_id, p3, 3), (v_bundle_id, p4, 4) ON CONFLICT DO NOTHING;

  -- 11. Cross-Sector Compliance Certificate Bundle
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Cross-Sector Compliance Certificate Bundle', 'cross-sector-compliance-certificate',
    'Healthcare waste management certificate plus practical waste segregation and staff training.',
    147, 184, 37, 'Practice managers, clinic owners, compliance officers', v_cross, true, 11)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, x1, 1), (v_bundle_id, x2, 2) ON CONFLICT DO NOTHING;

  -- 12. Complete Professional Certificate Bundle
  INSERT INTO course_bundles (name, slug, description, bundle_price, individual_total, saving_amount, target_audience, sector_id, published, display_order)
  VALUES ('Complete Professional Certificate Bundle', 'complete-professional-certificate-bundle',
    'All 3 Cross-Sector courses: healthcare waste management, staff training, and data-driven sustainability. Save £54.',
    217, 271, 54, 'Business owners, practice managers, sustainability leads', v_cross, true, 12)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, bundle_price = EXCLUDED.bundle_price, individual_total = EXCLUDED.individual_total, saving_amount = EXCLUDED.saving_amount, target_audience = EXCLUDED.target_audience, sector_id = EXCLUDED.sector_id, published = true, display_order = EXCLUDED.display_order
  RETURNING id INTO v_bundle_id;

  INSERT INTO bundle_courses (bundle_id, course_id, display_order) VALUES (v_bundle_id, x1, 1), (v_bundle_id, x2, 2), (v_bundle_id, x3, 3) ON CONFLICT DO NOTHING;
END $$;
