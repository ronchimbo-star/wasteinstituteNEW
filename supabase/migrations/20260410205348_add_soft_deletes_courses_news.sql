/*
  # Add soft delete support to courses and news_articles

  ## Summary
  Instead of permanently removing courses and news articles, admins can now
  archive them by setting a `deleted_at` timestamp. Records with a non-null
  `deleted_at` are treated as deleted but remain recoverable.

  ## Changes
  1. `courses` — adds `deleted_at timestamptz` column (nullable, default null).
  2. `news_articles` — adds `deleted_at timestamptz` column (nullable, default null).

  ## Notes
  - Existing rows are unaffected (all `deleted_at` values default to null).
  - Application queries must add `.is('deleted_at', null)` to exclude archived rows.
  - Admin "restore" actions set `deleted_at` back to null.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE courses ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_articles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS courses_deleted_at_idx       ON courses(deleted_at)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS news_articles_deleted_at_idx ON news_articles(deleted_at) WHERE deleted_at IS NULL;
