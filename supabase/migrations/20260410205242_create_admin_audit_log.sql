/*
  # Create admin_audit_log table

  ## Summary
  Provides a tamper-evident audit trail of every write action performed by staff
  users through the admin panel. Rows are append-only; no UPDATE or DELETE
  policies are granted.

  ## New Table: admin_audit_log
  | Column       | Type        | Description                                       |
  |--------------|-------------|---------------------------------------------------|
  | id           | uuid PK     | Auto-generated row identifier                     |
  | user_id      | uuid        | FK → auth.users — who performed the action        |
  | user_email   | text        | Denormalised email for readability                |
  | action       | text        | Verb: create, update, delete, publish, etc.       |
  | resource     | text        | Table/entity name: course, news_article, etc.     |
  | resource_id  | text        | PK of the affected row (text to be generic)       |
  | details      | jsonb       | Before/after snapshot or extra context            |
  | ip_address   | text        | Client IP (set by calling code if available)      |
  | created_at   | timestamptz | When the action occurred (server time)            |

  ## Security
  - RLS enabled with a single SELECT policy for super_admin only.
  - INSERT policy allows any authenticated user (log entries are written by
    server-side code in trusted contexts).
  - No UPDATE or DELETE policies — rows cannot be modified once written.
*/

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  text        NOT NULL DEFAULT '',
  action      text        NOT NULL,
  resource    text        NOT NULL,
  resource_id text,
  details     jsonb,
  ip_address  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_user_id_idx    ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_resource_idx   ON admin_audit_log(resource);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read audit log"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Authenticated users can insert audit entries"
  ON admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
