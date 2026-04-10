/*
  # Create Newsletter Subscriptions Table

  ## Summary
  Adds a newsletter_subscriptions table so visitors can subscribe to the Waste Institute newsletter
  directly from the homepage or footer without needing a full account.

  ## New Tables
  - `newsletter_subscriptions`
    - `id` (uuid, primary key)
    - `email` (text, unique, not null) — subscriber email address
    - `first_name` (text) — optional first name for personalisation
    - `status` (text) — 'active' | 'unsubscribed' | 'bounced', defaults to 'active'
    - `source` (text) — where they signed up from (e.g. 'homepage', 'footer')
    - `subscribed_at` (timestamptz) — when they subscribed
    - `unsubscribed_at` (timestamptz) — when/if they unsubscribed
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Anyone (including anonymous users) can INSERT their own subscription
  - Super admins can SELECT, UPDATE, DELETE all subscriptions
  - No authenticated user can read others' subscriptions
*/

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source text DEFAULT 'website',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can view all subscriptions"
  ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update subscriptions"
  ON newsletter_subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete subscriptions"
  ON newsletter_subscriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions (subscribed_at DESC);
