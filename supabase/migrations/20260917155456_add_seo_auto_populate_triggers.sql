/*
# Auto-populate SEO fields on new content

1. Purpose
   When new courses, news articles, or static pages are created without SEO metadata,
   these triggers auto-populate seo_title, seo_description, and seo_keywords
   so future content is always crawlable. Also ensures H1 tags exist in article content.

2. Functions
   - `auto_populate_course_seo()` — fires BEFORE INSERT on courses; fills seo_title from title, seo_description from description, seo_keywords with defaults
   - `auto_populate_news_article_seo()` — fires BEFORE INSERT on news_articles; fills seo_title from title, seo_description from excerpt, and prepends an H1 to content if missing
   - `auto_populate_static_page_seo()` — fires BEFORE INSERT on static_pages; fills seo_title and seo_description from title/content

3. Notes
   - All triggers are BEFORE INSERT, so they only fill empty/null fields — they never overwrite values the application explicitly set.
   - SEO titles are truncated to 48 chars + ' | Waste Institute' (max 66 chars total).
   - SEO descriptions are truncated to 155 chars.
   - The news article trigger also ensures content starts with an <h1> tag matching the article title.
*/

CREATE OR REPLACE FUNCTION auto_populate_course_seo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF coalesce(NEW.seo_title, '') = '' OR length(trim(NEW.seo_title)) NOT BETWEEN 30 AND 60 THEN
    NEW.seo_title := left(trim(NEW.title), 48) || ' | Waste Institute';
  END IF;
  IF coalesce(NEW.seo_description, '') = '' OR length(trim(NEW.seo_description)) NOT BETWEEN 120 AND 155 THEN
    NEW.seo_description := left(trim(coalesce(NEW.description, '')) || ' Explore online training and certification from Waste Institute.', 155);
  END IF;
  IF coalesce(NEW.seo_keywords, '') = '' THEN
    NEW.seo_keywords := 'waste management, professional training, certification, Waste Institute';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_populate_course_seo ON courses;
CREATE TRIGGER trg_auto_populate_course_seo
  BEFORE INSERT ON courses
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_course_seo();

CREATE OR REPLACE FUNCTION auto_populate_news_article_seo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF coalesce(NEW.seo_title, '') = '' OR length(trim(NEW.seo_title)) NOT BETWEEN 30 AND 60 THEN
    NEW.seo_title := left(trim(NEW.title), 47) || ' | Waste Institute';
  END IF;
  IF coalesce(NEW.seo_description, '') = '' OR length(trim(NEW.seo_description)) NOT BETWEEN 120 AND 155 THEN
    NEW.seo_description := left(trim(coalesce(NEW.excerpt, '')) || ' Read practical waste management insight from Waste Institute experts.', 155);
  END IF;
  IF position('<h1' in lower(coalesce(NEW.content, ''))) = 0 THEN
    NEW.content := '<h1>' || replace(replace(replace(NEW.title, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</h1>' || E'\n' || coalesce(NEW.content, '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_populate_news_article_seo ON news_articles;
CREATE TRIGGER trg_auto_populate_news_article_seo
  BEFORE INSERT ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_news_article_seo();

CREATE OR REPLACE FUNCTION auto_populate_static_page_seo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF coalesce(NEW.seo_title, '') = '' THEN
    NEW.seo_title := left(trim(NEW.title), 45) || ' | Waste Institute';
  END IF;
  IF coalesce(NEW.seo_description, '') = '' THEN
    NEW.seo_description := left(trim(coalesce(NEW.content, '')) || ' Learn more about Waste Institute courses and professional training.', 155);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_populate_static_page_seo ON static_pages;
CREATE TRIGGER trg_auto_populate_static_page_seo
  BEFORE INSERT ON static_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_static_page_seo();
