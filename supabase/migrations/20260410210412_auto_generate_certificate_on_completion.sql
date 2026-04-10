/*
  # Auto-generate certificate when a course reaches 100% completion

  ## Summary
  A PostgreSQL trigger fires after every INSERT or UPDATE on `user_progress`.
  It checks whether the affected user has now completed every lesson in the
  relevant course. If so, and no certificate exists yet, it inserts one
  automatically.

  ## How it works
  1. `get_course_id_for_lesson(lesson_id)` — helper that walks
     lessons → modules → courses to resolve the course UUID.
  2. `auto_generate_certificate()` — trigger function that:
     a. Resolves the course from the updated lesson.
     b. Counts total lessons vs completed lessons for that user+course.
     c. If completion rate = 100% and no certificate exists, inserts a
        new row into `certificates` with a UUID-based certificate_id.
  3. `user_progress_certificate_trigger` — AFTER INSERT OR UPDATE trigger
     on `user_progress` that calls the function above.

  ## Notes
  - Only fires when `NEW.completed = true` to avoid unnecessary work.
  - Uses `gen_random_uuid()` for the human-visible certificate_id, making
    sequential guessing infeasible.
  - Idempotent: does nothing if a certificate already exists.
*/

CREATE OR REPLACE FUNCTION get_course_id_for_lesson(p_lesson_id uuid)
RETURNS uuid AS $$
  SELECT m.course_id
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  WHERE l.id = p_lesson_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auto_generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id       uuid;
  v_total_lessons   integer;
  v_completed       integer;
  v_cert_exists     boolean;
BEGIN
  IF NEW.completed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  v_course_id := get_course_id_for_lesson(NEW.lesson_id);
  IF v_course_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id;

  IF v_total_lessons = 0 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_completed
  FROM user_progress up
  JOIN lessons l ON l.id = up.lesson_id
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id
    AND up.user_id = NEW.user_id
    AND up.completed = true;

  IF v_completed < v_total_lessons THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM certificates
    WHERE user_id = NEW.user_id AND course_id = v_course_id
  ) INTO v_cert_exists;

  IF v_cert_exists THEN
    RETURN NEW;
  END IF;

  INSERT INTO certificates (user_id, course_id, certificate_id, issued_date)
  VALUES (
    NEW.user_id,
    v_course_id,
    'WI-' || upper(replace(gen_random_uuid()::text, '-', '')),
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS user_progress_certificate_trigger ON user_progress;

CREATE TRIGGER user_progress_certificate_trigger
  AFTER INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_certificate();
