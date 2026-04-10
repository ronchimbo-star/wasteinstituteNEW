/*
  # Add full-text search to courses and news_articles

  ## Summary
  Adds a generated `fts` tsvector column to each table. PostgreSQL automatically
  keeps these columns up to date whenever the source columns change. GIN indexes
  make phrase and keyword searches fast even at scale.

  ## Changes
  1. `courses` — `fts` column generated from `title || description || level`
  2. `news_articles` — `fts` column generated from `title || excerpt || content`
  3. GIN indexes on both `fts` columns

  ## Notes
  - Queries use `.textSearch('fts', term)` via the Supabase JS client.
  - The `english` dictionary handles stemming (run → running → runs).
*/

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(level, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS courses_fts_idx ON courses USING GIN(fts);

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(content, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS news_articles_fts_idx ON news_articles USING GIN(fts);
