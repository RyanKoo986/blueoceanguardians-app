-- =====================================================================
-- Blue Guardians: content reports, user blocks, member-only posting
-- Date: 2026-10-16
--
-- Run in Supabase Dashboard > SQL Editor on the live database. Safe to re-run.
-- Google Play user-generated content (UGC) policy:
-- - Members can report posts/comments; admins review them (content_reports)
-- - Members can block other members, whose posts/comments are then hidden (user_blocks)
-- - Only signed-in members, who accepted the terms at signup, can publish posts
-- - Starter posts by the admin account, so reviewers can see the report/block buttons
-- =====================================================================

CREATE TABLE IF NOT EXISTS dokdo_guardians.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL DEFAULT auth.uid() REFERENCES dokdo_guardians.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES dokdo_guardians.archive_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES dokdo_guardians.archive_comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'sexual', 'hate', 'privacy', 'misinformation', 'other')),
    detail TEXT CHECK (char_length(detail) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (reporter_id, post_id, comment_id)
);

CREATE TABLE IF NOT EXISTS dokdo_guardians.user_blocks (
    blocker_id UUID NOT NULL DEFAULT auth.uid() REFERENCES dokdo_guardians.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES dokdo_guardians.profiles(id) ON DELETE CASCADE,
    blocked_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

ALTER TABLE dokdo_guardians.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.user_blocks ENABLE ROW LEVEL SECURITY;
GRANT ALL ON dokdo_guardians.content_reports, dokdo_guardians.user_blocks TO postgres, anon, authenticated, service_role;

-- Reports: members file them, only admins can read or resolve them
DROP POLICY IF EXISTS "content_reports_insert_member" ON dokdo_guardians.content_reports;
CREATE POLICY "content_reports_insert_member" ON dokdo_guardians.content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());
DROP POLICY IF EXISTS "content_reports_admin_manage" ON dokdo_guardians.content_reports;
CREATE POLICY "content_reports_admin_manage" ON dokdo_guardians.content_reports
  FOR ALL USING (dokdo_guardians.is_admin()) WITH CHECK (dokdo_guardians.is_admin());

-- Blocks: each member manages only their own block list
DROP POLICY IF EXISTS "user_blocks_own" ON dokdo_guardians.user_blocks;
CREATE POLICY "user_blocks_own" ON dokdo_guardians.user_blocks
  FOR ALL USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

-- Posts: members only (guests can no longer publish); notices stay admin-only
DROP POLICY IF EXISTS "posts_insert_as_self_or_guest" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "posts_insert_as_member" ON dokdo_guardians.archive_posts;
CREATE POLICY "posts_insert_as_member" ON dokdo_guardians.archive_posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND author_id = auth.uid()
    AND (board_type <> 'notice' OR dokdo_guardians.is_admin())
  );

-- Attachments: only the post's author or an admin (there are no new anonymous posts)
CREATE OR REPLACE FUNCTION dokdo_guardians.can_attach_to_post(target_post uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dokdo_guardians.archive_posts p
    WHERE p.id = target_post
      AND (p.author_id = auth.uid() OR dokdo_guardians.is_admin())
  );
$$;

-- Starter posts by the admin account (dokdo-admin@sol.com): the boards are empty, and Play
-- reviewers need another member's post to see the report/block buttons.
-- Skipped when the admin profile is missing; re-running does not duplicate posts or comments.
INSERT INTO dokdo_guardians.archive_posts (board_type, title, content, author_id, author_name, visibility, is_important)
SELECT starter.board_type, starter.title, starter.content, admin_profile.id, '블루 가디언즈 운영팀', 'public', starter.is_important
FROM (VALUES
  ('notice', '블루 가디언즈 서비스 오픈 안내',
'쿠다(KUDA, 사단법인 대한잠수협회)와 함께하는 독도 수호 플랫폼 블루 가디언즈가 문을 열었습니다.

· 독도 자료와 수중 정화 활동 게시판에서 기록을 나눌 수 있습니다.
· 수중정화 메뉴에서 활동 참여를 신청할 수 있습니다.
· 온라인에서 발견한 독도 관련 오류 정보를 제보할 수 있습니다.

게시판은 이용약관을 지켜 이용해 주시고, 부적절한 게시물이나 댓글은 [신고] 버튼으로 알려 주세요.', true),
  ('dokdo', '독도 기본 정보',
'· 위치: 경상북도 울릉군 울릉읍 독도리
· 구성: 동도와 서도, 그리고 주변의 89개 부속도서
· 울릉도에서 동남쪽으로 약 87.4km 떨어져 있어 맑은 날에는 울릉도에서 맨눈으로 볼 수 있습니다.
· 섬 전체가 천연기념물 ''독도 천연보호구역''으로 지정되어 보호되고 있습니다.', false),
  ('cleanup', '독도 수중정화 활동 참여 안내',
'대한잠수협회(KUDA)는 독도와 우리 바다의 수중 환경을 지키기 위해 잠수부들과 함께 수중 정화 활동을 이어가고 있습니다.

참여를 원하시는 분은 하단 메뉴의 ''수중정화''에서 참여 신청서를 작성해 주세요. 담당자가 확인한 뒤 연락드립니다.
활동 사진과 후기는 이 게시판에 자유롭게 공유해 주세요.', false)
) AS starter(board_type, title, content, is_important)
CROSS JOIN (SELECT id FROM dokdo_guardians.profiles WHERE email = 'dokdo-admin@sol.com') AS admin_profile
WHERE NOT EXISTS (
  SELECT 1 FROM dokdo_guardians.archive_posts p WHERE p.title = starter.title AND p.author_id = admin_profile.id
);

-- One admin comment, so the comment report/block links can be reviewed too
INSERT INTO dokdo_guardians.archive_comments (post_id, author_id, author_name, content)
SELECT p.id, p.author_id, p.author_name, '독도 관련 사진이나 자료를 갖고 계신 분은 이 게시판에 함께 공유해 주세요.'
FROM dokdo_guardians.archive_posts p
JOIN dokdo_guardians.profiles admin_profile ON admin_profile.id = p.author_id AND admin_profile.email = 'dokdo-admin@sol.com'
WHERE p.title = '독도 기본 정보'
  AND NOT EXISTS (SELECT 1 FROM dokdo_guardians.archive_comments c WHERE c.post_id = p.id AND c.author_id = p.author_id);
