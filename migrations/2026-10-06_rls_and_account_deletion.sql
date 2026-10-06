-- =====================================================================
-- Blue Guardians: RLS hardening, member management, account deletion
-- Date: 2026-10-06
--
-- Run ONCE in Supabase Dashboard > SQL Editor on the live database.
-- - Keeps all existing data (no DROP TABLE). Safe to re-run.
-- - Only touches the dokdo_guardians schema and the guardians-storage bucket.
--   auth.users is shared with other apps in this project: account deletion
--   removes the login only when no other app schema has a profile for that user.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Helper functions
-- ---------------------------------------------------------------------

-- Caller is an ADMIN of this app (SECURITY DEFINER bypasses RLS, so no policy recursion)
CREATE OR REPLACE FUNCTION dokdo_guardians.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dokdo_guardians.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- Guests may attach files to their own just-created anonymous posts
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

-- ---------------------------------------------------------------------
-- 2. Block self-promotion: role and email change only by admins (or SQL Editor)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 3. Row Level Security policies (replace the old allow-all policies)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public select on profiles" ON dokdo_guardians.profiles;
DROP POLICY IF EXISTS "Allow public insert on profiles" ON dokdo_guardians.profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON dokdo_guardians.profiles;
DROP POLICY IF EXISTS "Allow public select on archive_posts" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "Allow public all on archive_posts" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "Allow public all on archive_files" ON dokdo_guardians.archive_files;
DROP POLICY IF EXISTS "Allow public all on archive_comments" ON dokdo_guardians.archive_comments;
DROP POLICY IF EXISTS "Allow public all on cleanup_requests" ON dokdo_guardians.cleanup_requests;
DROP POLICY IF EXISTS "Allow public all on cleanup_files" ON dokdo_guardians.cleanup_files;
DROP POLICY IF EXISTS "Allow public all on reports" ON dokdo_guardians.reports;
DROP POLICY IF EXISTS "Allow public all on report_files" ON dokdo_guardians.report_files;
DROP POLICY IF EXISTS "Allow public all on contacts" ON dokdo_guardians.contacts;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON dokdo_guardians.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON dokdo_guardians.profiles;
DROP POLICY IF EXISTS "posts_select_visible" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "posts_insert_as_self_or_guest" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "posts_update_author_or_admin" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "posts_delete_author_or_admin" ON dokdo_guardians.archive_posts;
DROP POLICY IF EXISTS "post_files_select_visible" ON dokdo_guardians.archive_files;
DROP POLICY IF EXISTS "post_files_insert_attachable" ON dokdo_guardians.archive_files;
DROP POLICY IF EXISTS "comments_select_visible" ON dokdo_guardians.archive_comments;
DROP POLICY IF EXISTS "comments_insert_as_self" ON dokdo_guardians.archive_comments;
DROP POLICY IF EXISTS "comments_update_author_or_admin" ON dokdo_guardians.archive_comments;
DROP POLICY IF EXISTS "comments_delete_author_or_admin" ON dokdo_guardians.archive_comments;
DROP POLICY IF EXISTS "cleanup_insert_anyone" ON dokdo_guardians.cleanup_requests;
DROP POLICY IF EXISTS "cleanup_admin_manage" ON dokdo_guardians.cleanup_requests;
DROP POLICY IF EXISTS "cleanup_files_insert_anyone" ON dokdo_guardians.cleanup_files;
DROP POLICY IF EXISTS "cleanup_files_admin_manage" ON dokdo_guardians.cleanup_files;
DROP POLICY IF EXISTS "reports_insert_anyone" ON dokdo_guardians.reports;
DROP POLICY IF EXISTS "reports_admin_manage" ON dokdo_guardians.reports;
DROP POLICY IF EXISTS "report_files_insert_anyone" ON dokdo_guardians.report_files;
DROP POLICY IF EXISTS "report_files_admin_manage" ON dokdo_guardians.report_files;
DROP POLICY IF EXISTS "contacts_insert_anyone" ON dokdo_guardians.contacts;
DROP POLICY IF EXISTS "contacts_admin_manage" ON dokdo_guardians.contacts;

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

-- Storage: public read and uploads stay open (guest report photos); edit/delete admin only
DROP POLICY IF EXISTS "Allow Updates on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Deletes on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Updates on guardians-storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Deletes on guardians-storage" ON storage.objects;
CREATE POLICY "Admin Updates on guardians-storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'guardians-storage' AND dokdo_guardians.is_admin());
CREATE POLICY "Admin Deletes on guardians-storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'guardians-storage' AND dokdo_guardians.is_admin());

-- ---------------------------------------------------------------------
-- 4. RPC functions used by the app
-- ---------------------------------------------------------------------

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

-- Internal: anonymize the member's posts/comments, delete the profile, then the login
-- (login kept if another app in this Supabase project still has a profile for the user)
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

-- ---------------------------------------------------------------------
-- 5. Function privileges
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION dokdo_guardians.purge_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION dokdo_guardians.delete_my_account() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION dokdo_guardians.admin_delete_user(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION dokdo_guardians.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.can_attach_to_post(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.increment_post_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.email_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.create_my_profile(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.delete_my_account() TO authenticated;
GRANT EXECUTE ON FUNCTION dokdo_guardians.admin_delete_user(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
