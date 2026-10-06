-- ==============================================================================
-- Project: Dokdo Ocean Guardians (블루오션 가디언스)
-- Database: PostgreSQL (Supabase Compatible)
-- Schema: dokdo_guardians
-- Description: 독도 및 해양 수호 활동, 아카이브, 정화활동 신청, 오염 제보, 회원 관리 스키마
-- Security & DDL Rule:
--   - ALWAYS use explicit direct GRANT statements on specific schema tables.
--   - NEVER use ALTER DEFAULT PRIVILEGES to avoid unintended global permission overrides across other schemas.
-- ==============================================================================

-- 1. Custom Schema Isolation
CREATE SCHEMA IF NOT EXISTS dokdo_guardians;

-- Set search path for current session
SET search_path TO dokdo_guardians, public;

-- 2. Clean Drop (Safe Resets with CASCADE)
DROP TABLE IF EXISTS dokdo_guardians.contacts CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.report_files CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.reports CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.cleanup_files CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.cleanup_requests CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.archive_comments CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.archive_files CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.archive_posts CASCADE;
DROP TABLE IF EXISTS dokdo_guardians.profiles CASCADE;

-- 3. Table Definitions

-- [Profiles Table] 사용자 프로필 및 권한
CREATE TABLE dokdo_guardians.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'RESEARCHER')),
    birth_date TEXT,
    address TEXT,
    phone TEXT,
    affiliation TEXT,
    license_grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Archive Posts] 독도 연구 자료, 보도자료, 활동 보고 게시글
CREATE TABLE dokdo_guardians.archive_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_type TEXT NOT NULL CHECK (board_type IN ('research', 'press', 'notice', 'activity', 'default')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES dokdo_guardians.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    views INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Archive Files] 게시글 첨부 파일
CREATE TABLE dokdo_guardians.archive_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES dokdo_guardians.archive_posts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Archive Comments] 아카이브 게시글 댓글
CREATE TABLE dokdo_guardians.archive_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES dokdo_guardians.archive_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES dokdo_guardians.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Cleanup Requests] 해양 정화 활동 신청
CREATE TABLE dokdo_guardians.cleanup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    region TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Cleanup Files] 정화활동 신청 첨부파일
CREATE TABLE dokdo_guardians.cleanup_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleanup_id UUID NOT NULL REFERENCES dokdo_guardians.cleanup_requests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Reports] 해양 생태계 훼손 / 쓰레기 / 불법행위 제보
CREATE TABLE dokdo_guardians.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT,
    description TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Report Files] 제보 첨부 이미지 / 파일
CREATE TABLE dokdo_guardians.report_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES dokdo_guardians.reports(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Contacts] 1:1 문의사항
CREATE TABLE dokdo_guardians.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_archive_board_created ON dokdo_guardians.archive_posts(board_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_category ON dokdo_guardians.archive_posts(category);
CREATE INDEX IF NOT EXISTS idx_archive_files_post ON dokdo_guardians.archive_files(post_id);
CREATE INDEX IF NOT EXISTS idx_archive_comments_post ON dokdo_guardians.archive_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_created ON dokdo_guardians.cleanup_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_created ON dokdo_guardians.reports(created_at DESC);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE dokdo_guardians.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.archive_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.archive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.archive_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.cleanup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.cleanup_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokdo_guardians.contacts ENABLE ROW LEVEL SECURITY;

-- Helper: caller is an ADMIN of this app (SECURITY DEFINER bypasses RLS, so no policy recursion)
CREATE OR REPLACE FUNCTION dokdo_guardians.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dokdo_guardians.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- Helper: guests may attach files to their own just-created anonymous posts
CREATE OR REPLACE FUNCTION dokdo_guardians.can_attach_to_post(target_post uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dokdo_guardians.archive_posts p
    WHERE p.id = target_post
      AND (p.author_id IS NULL OR p.author_id = auth.uid() OR dokdo_guardians.is_admin())
  );
$$;

-- Block self-promotion: role and email change only by admins (or SQL Editor)
CREATE OR REPLACE FUNCTION dokdo_guardians.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated')
     AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.email IS DISTINCT FROM OLD.email)
     AND NOT dokdo_guardians.is_admin() THEN
    RAISE EXCEPTION '권한 또는 이메일은 관리자만 변경할 수 있습니다.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields ON dokdo_guardians.profiles;
CREATE TRIGGER protect_profile_fields
  BEFORE UPDATE ON dokdo_guardians.profiles
  FOR EACH ROW EXECUTE FUNCTION dokdo_guardians.protect_profile_fields();

-- Profiles: own row or admin. Inserts go through create_my_profile(), deletes through purge functions.
CREATE POLICY "profiles_select_own_or_admin" ON dokdo_guardians.profiles
  FOR SELECT USING (id = auth.uid() OR dokdo_guardians.is_admin());
CREATE POLICY "profiles_update_own_or_admin" ON dokdo_guardians.profiles
  FOR UPDATE USING (id = auth.uid() OR dokdo_guardians.is_admin())
  WITH CHECK (id = auth.uid() OR dokdo_guardians.is_admin());

-- Archive posts: public posts for everyone, private posts for author/admin
CREATE POLICY "posts_select_visible" ON dokdo_guardians.archive_posts
  FOR SELECT USING (visibility = 'public' OR author_id = auth.uid() OR dokdo_guardians.is_admin());
CREATE POLICY "posts_insert_as_self_or_guest" ON dokdo_guardians.archive_posts
  FOR INSERT WITH CHECK (author_id IS NULL OR author_id = auth.uid());
CREATE POLICY "posts_update_author_or_admin" ON dokdo_guardians.archive_posts
  FOR UPDATE USING (author_id = auth.uid() OR dokdo_guardians.is_admin())
  WITH CHECK (author_id = auth.uid() OR dokdo_guardians.is_admin());
CREATE POLICY "posts_delete_author_or_admin" ON dokdo_guardians.archive_posts
  FOR DELETE USING (author_id = auth.uid() OR dokdo_guardians.is_admin());

-- Post files and comments follow the visibility of their post
CREATE POLICY "post_files_select_visible" ON dokdo_guardians.archive_files
  FOR SELECT USING (EXISTS (SELECT 1 FROM dokdo_guardians.archive_posts p WHERE p.id = post_id));
CREATE POLICY "post_files_insert_attachable" ON dokdo_guardians.archive_files
  FOR INSERT WITH CHECK (dokdo_guardians.can_attach_to_post(post_id));

CREATE POLICY "comments_select_visible" ON dokdo_guardians.archive_comments
  FOR SELECT USING (EXISTS (SELECT 1 FROM dokdo_guardians.archive_posts p WHERE p.id = post_id));
CREATE POLICY "comments_insert_as_self" ON dokdo_guardians.archive_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());
CREATE POLICY "comments_update_author_or_admin" ON dokdo_guardians.archive_comments
  FOR UPDATE USING (author_id = auth.uid() OR dokdo_guardians.is_admin())
  WITH CHECK (author_id = auth.uid() OR dokdo_guardians.is_admin());
CREATE POLICY "comments_delete_author_or_admin" ON dokdo_guardians.archive_comments
  FOR DELETE USING (author_id = auth.uid() OR dokdo_guardians.is_admin());

-- Guest submissions: anyone can submit, only admins can read/manage
CREATE POLICY "cleanup_insert_anyone" ON dokdo_guardians.cleanup_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "cleanup_admin_manage" ON dokdo_guardians.cleanup_requests
  FOR ALL USING (dokdo_guardians.is_admin()) WITH CHECK (dokdo_guardians.is_admin());
CREATE POLICY "cleanup_files_insert_anyone" ON dokdo_guardians.cleanup_files
  FOR INSERT WITH CHECK (true);
CREATE POLICY "cleanup_files_admin_manage" ON dokdo_guardians.cleanup_files
  FOR ALL USING (dokdo_guardians.is_admin()) WITH CHECK (dokdo_guardians.is_admin());

CREATE POLICY "reports_insert_anyone" ON dokdo_guardians.reports
  FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_admin_manage" ON dokdo_guardians.reports
  FOR ALL USING (dokdo_guardians.is_admin()) WITH CHECK (dokdo_guardians.is_admin());
CREATE POLICY "report_files_insert_anyone" ON dokdo_guardians.report_files
  FOR INSERT WITH CHECK (true);
CREATE POLICY "report_files_admin_manage" ON dokdo_guardians.report_files
  FOR ALL USING (dokdo_guardians.is_admin()) WITH CHECK (dokdo_guardians.is_admin());

CREATE POLICY "contacts_insert_anyone" ON dokdo_guardians.contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_admin_manage" ON dokdo_guardians.contacts
  FOR ALL USING (dokdo_guardians.is_admin()) WITH CHECK (dokdo_guardians.is_admin());

-- 6. Schema & Table Access Grants for Supabase API Roles (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;

-- 6-1. RPC Functions (member signup, view counter, account deletion)

-- View counter without granting UPDATE on posts
CREATE OR REPLACE FUNCTION dokdo_guardians.increment_post_views(post_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$
  UPDATE dokdo_guardians.archive_posts p
  SET views = p.views + 1
  WHERE p.id = post_id
    AND (p.visibility = 'public' OR p.author_id = auth.uid() OR dokdo_guardians.is_admin());
$$;

-- Signup duplicate check without exposing the member list
CREATE OR REPLACE FUNCTION dokdo_guardians.email_exists(p_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dokdo_guardians.profiles WHERE lower(email) = lower(trim(p_email))
  );
$$;

-- Creates the profile of a freshly signed-up user (works with or without email confirmation).
-- Role is always USER; admins are promoted from the admin dashboard.
CREATE OR REPLACE FUNCTION dokdo_guardians.create_my_profile(profile jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  target uuid := (profile->>'id')::uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> target THEN
    RAISE EXCEPTION '본인 프로필만 생성할 수 있습니다.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = target
      AND lower(u.email) = lower(trim(profile->>'email'))
      AND u.created_at > now() - interval '1 hour'
  ) THEN
    RAISE EXCEPTION '가입 정보를 확인할 수 없습니다.';
  END IF;

  INSERT INTO dokdo_guardians.profiles
    (id, email, name, role, birth_date, address, phone, affiliation, license_grade)
  VALUES (
    target,
    lower(trim(profile->>'email')),
    coalesce(nullif(trim(profile->>'name'), ''), '새 가디언'),
    'USER',
    profile->>'birth_date',
    profile->>'address',
    profile->>'phone',
    profile->>'affiliation',
    profile->>'license_grade'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Internal: anonymize the member's posts/comments, delete the profile, then the login.
-- auth.users is shared by every app in this Supabase project, so the login is kept
-- when another app schema still has a profile for the user.
CREATE OR REPLACE FUNCTION dokdo_guardians.purge_member(target uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  other_schema text;
  used_elsewhere boolean := false;
BEGIN
  UPDATE dokdo_guardians.archive_posts SET author_name = '탈퇴한 회원' WHERE author_id = target;
  UPDATE dokdo_guardians.archive_comments SET author_name = '탈퇴한 회원' WHERE author_id = target;
  DELETE FROM dokdo_guardians.profiles WHERE id = target;

  FOR other_schema IN
    SELECT c.table_schema FROM information_schema.columns c
    WHERE c.table_name = 'profiles' AND c.column_name = 'id' AND c.table_schema <> 'dokdo_guardians'
  LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I.profiles WHERE id::text = $1)', other_schema)
      INTO used_elsewhere USING target::text;
    EXIT WHEN used_elsewhere;
  END LOOP;

  IF NOT used_elsewhere THEN
    DELETE FROM auth.users WHERE id = target;
  END IF;
END;
$$;

-- Member withdraws their own account
CREATE OR REPLACE FUNCTION dokdo_guardians.delete_my_account()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다.';
  END IF;
  PERFORM dokdo_guardians.purge_member(auth.uid());
END;
$$;

-- Admin removes a member from the admin dashboard
CREATE OR REPLACE FUNCTION dokdo_guardians.admin_delete_user(target uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT dokdo_guardians.is_admin() THEN
    RAISE EXCEPTION '관리자 권한이 필요합니다.';
  END IF;
  IF target = auth.uid() THEN
    RAISE EXCEPTION '본인 계정은 탈퇴 처리할 수 없습니다.';
  END IF;
  PERFORM dokdo_guardians.purge_member(target);
END;
$$;

REVOKE ALL ON FUNCTION dokdo_guardians.purge_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION dokdo_guardians.delete_my_account() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION dokdo_guardians.admin_delete_user(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION dokdo_guardians.increment_post_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.email_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.create_my_profile(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.delete_my_account() TO authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.admin_delete_user(uuid) TO authenticated;

-- 7. Initial Seed Data
INSERT INTO dokdo_guardians.profiles (id, email, name, role, affiliation, license_grade)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@blueoceanguardians.org', '관리자', 'ADMIN', '블루오션 가디언스 본부', '마스터'),
    ('00000000-0000-0000-0000-000000000002', 'researcher@dokdo.re.kr', '김해양 연구원', 'RESEARCHER', '독도해양연구소', '수석연구원')
ON CONFLICT (id) DO NOTHING;

INSERT INTO dokdo_guardians.archive_posts (id, board_type, title, content, author_id, author_name, visibility, views, category, is_important)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'research',
        '2026년 상반기 독도 연안 해양생태계 종합 모니터링 결과 보고',
        '독도 주변 해역의 수온 변화 및 아열대성 어종 출현 빈도에 대한 정밀 조사 결과 보고서입니다. 해조류 서식 환경 개선을 위한 지속적인 보전 활동이 필요합니다.',
        '00000000-0000-0000-0000-000000000002',
        '김해양 연구원',
        'public',
        142,
        '생태계 조사',
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'notice',
        '제4회 독도 바다정화 및 플로깅 자원봉사자 모집 안내',
        '깨끗한 독도 바다를 만들기 위한 2026년 봄맞이 해양 정화 캠페인이 시작됩니다. 많은 가디언스 여러분의 참여를 기다립니다.',
        '00000000-0000-0000-0000-000000000001',
        '관리자',
        'public',
        389,
        '공지사항',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- Seed Comments
INSERT INTO dokdo_guardians.archive_comments (id, post_id, author_id, author_name, content)
VALUES
    (
        '33333333-3333-3333-3333-333333333331',
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000002',
        '김해양 연구원',
        '이번 정화 활동에 연구소 팀원들과 함께 신청 완료했습니다!'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Supabase Storage Bucket Initialization ('guardians-storage')
INSERT INTO storage.buckets (id, name, public)
VALUES ('guardians-storage', 'guardians-storage', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies (Safe Recreation)
DROP POLICY IF EXISTS "Public Storage Access on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Updates on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Deletes on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Updates on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Deletes on guardians-storage" ON storage.objects;

-- Public read and uploads (guest report photos); edit/delete admin only
CREATE POLICY "Public Storage Access on guardians-storage" ON storage.objects FOR SELECT USING (bucket_id = 'guardians-storage');
CREATE POLICY "Allow Uploads on guardians-storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'guardians-storage');
CREATE POLICY "Admin Updates on guardians-storage" ON storage.objects FOR UPDATE USING (bucket_id = 'guardians-storage' AND dokdo_guardians.is_admin());
CREATE POLICY "Admin Deletes on guardians-storage" ON storage.objects FOR DELETE USING (bucket_id = 'guardians-storage' AND dokdo_guardians.is_admin());

NOTIFY pgrst, 'reload schema';


