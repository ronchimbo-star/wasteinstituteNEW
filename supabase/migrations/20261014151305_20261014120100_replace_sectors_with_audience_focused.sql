/*
# Replace sectors with 4 new audience-focused sectors

## Overview
The Waste Institute is being repositioned as MediWaste's training arm. The 14 existing
generic waste management sectors (Circular Economy, Hazardous Waste, Recycling, etc.)
are being replaced with 4 audience-focused sectors aligned to the new course catalogue.

## Changes
1. Mark all existing 14 sectors as show_in_public = false (NOT deleted — data preserved)
2. Insert 4 new sectors:
   - Beauty & Aesthetics (slug: beauty-aesthetics, display_order 1)
   - Tattoo & Piercing (slug: tattoo-piercing, display_order 2)
   - Podiatry (slug: podiatry, display_order 3)
   - Cross-Sector (slug: cross-sector, display_order 4)

## Security
No security changes — existing RLS policies on sectors remain unchanged.
*/

-- 1. Hide all existing sectors from public view
UPDATE sectors SET show_in_public = false WHERE show_in_public = true;

-- 2. Insert new sectors (use ON CONFLICT to handle re-runs)
INSERT INTO sectors (name, slug, description, icon, display_order, show_in_public)
VALUES
  ('Beauty & Aesthetics', 'beauty-aesthetics', 'Clinical waste management training for beauty salons, aesthetics clinics, and beauty therapists.', '💄', 1, true),
  ('Tattoo & Piercing', 'tattoo-piercing', 'Clinical waste and sharps safety training for tattoo studios and piercing professionals.', '🎨', 2, true),
  ('Podiatry', 'podiatry', 'Clinical waste and sharps management training for podiatrists and foot health practitioners.', '🦶', 3, true),
  ('Cross-Sector', 'cross-sector', 'Comprehensive healthcare waste management training suitable for all clinical and aesthetic practices.', '⚖️', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  show_in_public = EXCLUDED.show_in_public;
