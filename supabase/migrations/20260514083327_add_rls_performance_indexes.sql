/*
  # Add performance indexes for RLS policies and common queries

  1. Purpose
    - Speed up RLS policy evaluation by indexing columns used in auth checks
    - Add composite indexes for common dashboard and progress queries
    - Index the user_profiles.role column used in admin role checks

  2. New Indexes
    - `idx_user_profiles_role` on user_profiles(role) for fast RBAC lookups
    - `idx_user_progress_user_completed` on user_progress(user_id, completed) for progress queries
    - `idx_certificates_user_course` on certificates(user_id, course_id) for certificate lookups
    - `idx_certificates_revoked` on certificates(revoked) partial index
    - `idx_course_enrollments_user_status` on course_enrollments(user_id, status)
    - `idx_payments_user_status` on payments(user_id, status) for user payment lookups
    - `idx_modules_course_order` on modules(course_id, display_order) for course content
    - `idx_lessons_module_order` on lessons(module_id, display_order) for lesson ordering

  3. Notes
    - All indexes are IF NOT EXISTS to prevent errors on re-run
    - Focused on columns used in WHERE, JOIN, and ORDER BY clauses
    - Partial index on revoked certificates keeps index small
*/

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_completed ON user_progress(user_id, completed);

CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_certificates_revoked ON certificates(revoked) WHERE revoked = true;

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_status ON course_enrollments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, display_order);

CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons(module_id, display_order);
