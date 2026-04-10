/*
  # Create Events System

  ## Summary
  Adds a full events system so Waste Institute can publish and manage workshops, webinars,
  community cleanups, and conferences. Visitors can browse events and register interest.

  ## New Tables

  ### `events`
  The main events table for all public-facing events.
  - `id` (uuid, primary key)
  - `title` (text, not null) — event title
  - `slug` (text, unique) — URL-friendly identifier
  - `description` (text) — full event description
  - `excerpt` (text) — short summary for listings
  - `event_type` (text) — 'webinar' | 'workshop' | 'conference' | 'cleanup' | 'networking' | 'training'
  - `featured_image` (text) — banner image URL
  - `start_date` (timestamptz, not null) — when the event starts
  - `end_date` (timestamptz) — when the event ends (optional)
  - `location` (text) — venue name or "Online"
  - `address` (text) — full address for in-person events
  - `online_link` (text) — join URL for virtual events
  - `is_online` (boolean) — whether it's an online event
  - `capacity` (integer) — max attendees (null = unlimited)
  - `price` (numeric) — 0 = free
  - `currency` (text) — default 'GBP'
  - `registration_deadline` (timestamptz)
  - `organiser_name` (text)
  - `organiser_email` (text)
  - `published` (boolean) — whether visible to public
  - `featured` (boolean) — whether shown in homepage spotlight
  - `seo_title` (text)
  - `seo_description` (text)
  - `created_by` (uuid, FK to user_profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `event_registrations`
  Tracks who has registered interest or signed up for an event.
  - `id` (uuid, primary key)
  - `event_id` (uuid, FK to events)
  - `user_id` (uuid, FK to user_profiles, nullable — allows anonymous registrations)
  - `full_name` (text)
  - `email` (text)
  - `organisation` (text)
  - `notes` (text)
  - `status` (text) — 'pending' | 'confirmed' | 'cancelled' | 'waitlisted'
  - `registered_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Events: anyone can read published events; super admins manage all
  - Registrations: anyone can insert their own; super admins manage all; authenticated users can read their own
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  excerpt text DEFAULT '',
  event_type text NOT NULL DEFAULT 'webinar' CHECK (event_type IN ('webinar', 'workshop', 'conference', 'cleanup', 'networking', 'training')),
  featured_image text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text DEFAULT '',
  address text DEFAULT '',
  online_link text DEFAULT '',
  is_online boolean DEFAULT false,
  capacity integer,
  price numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'GBP',
  registration_deadline timestamptz,
  organiser_name text DEFAULT 'Waste Institute',
  organiser_email text DEFAULT 'info@wasteinstitute.org',
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  organisation text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlisted')),
  registered_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Super admins can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update events"
  ON events FOR UPDATE
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

CREATE POLICY "Super admins can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Anyone can register for events"
  ON event_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update registrations"
  ON event_registrations FOR UPDATE
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

CREATE POLICY "Super admins can delete registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_events_published ON events (published);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_events_slug ON events (slug);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events (event_type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations (email);
