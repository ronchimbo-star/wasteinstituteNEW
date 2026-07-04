ALTER TABLE ai_generation_jobs
  ADD COLUMN IF NOT EXISTS project_category TEXT DEFAULT 'WasteInstitute';
