-- =====================================================================
-- Blue Guardians: archive board types + admin-only notices
-- Date: 2026-10-07
--
-- Run in Supabase Dashboard > SQL Editor on the live database. Safe to re-run.
-- - Allows the archive tabs 'dokdo' (독도 자료) and 'cleanup' (수중 정화 활동);
--   previously they were rejected by the CHECK constraint and silently saved as 'notice'.
-- - Only admins may create or move posts into 'notice' (공지사항).
-- =====================================================================

ALTER TABLE dokdo_guardians.archive_posts DROP CONSTRAINT IF EXISTS archive_posts_board_type_check;
ALTER TABLE dokdo_guardians.archive_posts ADD CONSTRAINT archive_posts_board_type_check
  CHECK (board_type IN ('notice', 'dokdo', 'cleanup', 'research', 'press', 'activity', 'default'));

DROP POLICY IF EXISTS "posts_insert_as_self_or_guest" ON dokdo_guardians.archive_posts;
CREATE POLICY "posts_insert_as_self_or_guest" ON dokdo_guardians.archive_posts
  FOR INSERT WITH CHECK (
    (author_id IS NULL OR author_id = auth.uid())
    AND (board_type <> 'notice' OR dokdo_guardians.is_admin())
  );

DROP POLICY IF EXISTS "posts_update_author_or_admin" ON dokdo_guardians.archive_posts;
CREATE POLICY "posts_update_author_or_admin" ON dokdo_guardians.archive_posts
  FOR UPDATE USING (author_id = auth.uid() OR dokdo_guardians.is_admin())
  WITH CHECK ((author_id = auth.uid() AND board_type <> 'notice') OR dokdo_guardians.is_admin());
