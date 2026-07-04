ALTER TABLE sectors ADD COLUMN IF NOT EXISTS show_in_public BOOLEAN NOT NULL DEFAULT true;

-- Hide the admin-only categorisation sectors
UPDATE sectors SET show_in_public = false WHERE slug IN ('wamitab-rival', 'industry-niche', 'future-tech', 'ai-technology');
