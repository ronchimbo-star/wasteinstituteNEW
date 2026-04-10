/*
  # Rate limiting for contact and newsletter forms

  ## Summary
  Prevents abuse of the public-facing contact submission and newsletter
  subscription forms by limiting how many records can be created per IP address
  within a rolling time window.

  ## Changes
  1. `contact_submissions` — adds `ip_address` column + DB function
     `check_contact_rate_limit(ip text)` that raises an exception if more than
     5 submissions from the same IP exist within the last hour.
  2. `newsletter_subscriptions` — adds `ip_address` column.
  3. Both tables: honeypot column `bot_field text` — client forms render it as a
     hidden field; any non-empty value is rejected server-side.

  ## Notes
  - Rate limit is enforced inside a trigger so it cannot be bypassed at the
    client level.
  - The honeypot field provides lightweight bot detection without CAPTCHA.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE contact_submissions ADD COLUMN ip_address text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions' AND column_name = 'bot_field'
  ) THEN
    ALTER TABLE contact_submissions ADD COLUMN bot_field text DEFAULT '';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.bot_field IS NOT NULL AND NEW.bot_field <> '' THEN
    RAISE EXCEPTION 'Bot submission detected';
  END IF;

  IF NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM contact_submissions
    WHERE ip_address = NEW.ip_address
      AND created_at > NOW() - INTERVAL '1 hour';

    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_rate_limit_trigger ON contact_submissions;
CREATE TRIGGER contact_rate_limit_trigger
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION check_contact_rate_limit();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_subscriptions' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE newsletter_subscriptions ADD COLUMN ip_address text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_subscriptions' AND column_name = 'bot_field'
  ) THEN
    ALTER TABLE newsletter_subscriptions ADD COLUMN bot_field text DEFAULT '';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION check_newsletter_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.bot_field IS NOT NULL AND NEW.bot_field <> '' THEN
    RAISE EXCEPTION 'Bot submission detected';
  END IF;

  IF NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM newsletter_subscriptions
    WHERE ip_address = NEW.ip_address
      AND created_at > NOW() - INTERVAL '1 hour';

    IF recent_count >= 3 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletter_rate_limit_trigger ON newsletter_subscriptions;
CREATE TRIGGER newsletter_rate_limit_trigger
  BEFORE INSERT ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION check_newsletter_rate_limit();
