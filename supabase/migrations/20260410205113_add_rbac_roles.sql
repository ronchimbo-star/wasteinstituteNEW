/*
  # Expand RBAC roles

  ## Summary
  Extends the `user_profiles.role` column to support five distinct roles beyond
  the original `super_admin | admin | user` trio.

  ## New Roles
  - `content_editor` — Can create and edit news, events, pages, and FAQs but cannot
    access financial data, user management, or system settings.
  - `instructor` — Can manage courses, enrollments, and certificates but has no
    access to financial, user, or CMS data.
  - `support` — Read-only access to contact submissions, registrations, users, and
    members. Cannot modify records.

  ## Changes
  1. Drops the existing CHECK constraint on `role`.
  2. Adds a new CHECK constraint permitting all five valid values.
  3. Existing rows are unaffected (they already hold valid values).
*/

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'content_editor', 'instructor', 'support', 'user'));
