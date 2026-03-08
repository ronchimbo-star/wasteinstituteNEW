/*
  # Add Google Analytics to Site Settings

  1. New Setting
    - Adds `google_analytics_id` setting to site_settings table
  
  2. Notes
    - Uses upsert pattern to ensure setting exists
    - Default value is empty string
*/

INSERT INTO site_settings (key, value)
VALUES ('google_analytics_id', '')
ON CONFLICT (key) DO NOTHING;
