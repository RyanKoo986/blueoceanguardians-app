# Project Documentation: Blue Guardians (블루 가디언즈)

## 1. Overview
블루 가디언즈(Blue Guardians)는 독도 및 동해 해양 생태계 보전, 학술 연구 아카이브, 해양 오염/위험 실시간 제보 및 시민 참여형 비치코밍/정화 활동을 지원하는 크로스 플랫폼 웹/앱 프로젝트입니다.

---

## 2. Tech Stack Specs
- **Frontend Core**: React 18, TypeScript 5, Vite 5
- **Routing & State**: React Router DOM v6, React Context API (`AuthContext`)
- **Styling & UI**: TailwindCSS v3 compiled at build time via PostCSS (`tailwind.config.js`, `postcss.config.js`, directives in `src/index.css`) + Vanilla CSS, Lucide React Icons, Framer Motion
  - Custom theme lives in `tailwind.config.js` (`brand-cyan`, `brand-navy`, `font-sans` Noto Sans KR, `animate-fade-in-up`, dark mode via `[data-theme="dark"]`). Never paste precompiled Tailwind output into `index.css` — unlisted classes silently fail.
- **Linting**: ESLint 9 flat config (`eslint.config.js`): typescript-eslint, react-hooks v7 (React Compiler rules), react-refresh. `npm run lint` must report 0 errors before commit. Unused names follow the tsconfig `_` prefix convention. `no-explicit-any` and `react-hooks/set-state-in-effect` stay warnings until the existing usages are cleaned up.
- **Internationalization**: i18next, react-i18next
- **Backend & Database**: Supabase (PostgreSQL 15+, Custom Schema `dokdo_guardians`, Row Level Security, Supabase Storage)
- **Mobile Packaging (Target)**: Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`)
- **Native Config (not in git)**: `android/` and `ios/` are gitignored, so manual native settings (permissions, Info.plist usage descriptions, JDK 21, signing, versionCode) are recorded in `MOBILE_DEPLOYMENT_GUIDE.md`; re-apply them after `npx cap add`.
- **App Display Name**: `Blue Guardians` (`capacitor.config.ts` appName, `index.html` title)
- **AI Engine (GPT-4o)**: OpenAI GPT-4o called only from the Supabase Edge Function `dokdo-ai` (`supabase/functions/dokdo-ai/index.ts`, secret `OPENAI_API_KEY`, fixed tasks `factcheck`/`refine`/`expand`/`summarize`, max 5,000 chars); `aiService.ts` invokes it via `supabase.functions.invoke`. Never put the OpenAI key in a `VITE_*` variable. Deploy function changes by pasting the file into Dashboard > Edge Functions > dokdo-ai. `supabase/functions/tsconfig.json` + `deno-globals.d.ts` give VS Code Deno typings without the Deno extension (verify with `npx deno check supabase/functions/dokdo-ai/index.ts`). for real-time historical fact-checking, distortion correction, text refinement, and summarization with offline fallback.
- **Authentication & App Policy**:
  - **Guest Access**: All articles, research archive, AI fact checks, citizen error reports, cleanup applications and inquiries are available without login. Publishing posts and comments is for members only.
  - **UGC Moderation (Google Play UGC policy, `migrations/2026-10-16_ugc_moderation.sql`)**: signup requires confirming age 14+ (개인정보 보호법: under-14 signups would need guardian consent; Play target audience is 13+), agreeing to the terms (`/terms`, `Terms.tsx`) and the privacy collection notice; members report posts/comments (`ReportDialog.tsx` -> `content_reports`, reviewed in the admin "게시물 신고" tab, where deleting the content cascades its reports) and block members (`user_blocks`; blocked authors are hidden in the archive, unblock in MyPage `BlockedUsersSection.tsx`). Service: `moderationService.ts`.
  - **Role-based Permissions**: `ADMIN` role for official archive posts, notice publishing, and report moderation.
  - **App Store & Play Store Compliance (Privacy Policy)**: Single source of truth is the standalone `/privacy` route (`Privacy.tsx`), linked from the footer; it is also the Play Console privacy and account-deletion URL. Do not duplicate policy text elsewhere.
  - **Biometric Quick Login (native app only)**: `@capgo/capacitor-native-biometric`. After a password login (or from the MyPage/Admin toggle after re-entering the password), the email/password is stored with `AccessControl.BIOMETRY_ANY` in Android Keystore / iOS Keychain; `getSecureCredentials()` shows a biometric prompt cryptographically bound to decryption, then a normal Supabase `signInWithPassword` runs. Hidden on the web build (`Capacitor.isNativePlatform()`). Invalid stored logins are auto-removed.
  - **Account Deletion (App Store 5.1.1(v) / Google Play)**: `MyPage.tsx` -> `authService.deleteAccount` -> RPC `delete_my_account()`; admins use the Members tab (`AdminDashboard.tsx`) -> RPC `admin_delete_user()`. Both anonymize the member's posts/comments to '탈퇴한 회원', delete the profile, and delete the `auth.users` login unless another app schema in the shared Supabase project still has a `profiles` row for that user.
  - **App Store Guideline 4.2 Compliance (Native Touch Optimization)**: Global suppression of web callouts (`-webkit-touch-callout: none`), bounce elimination (`overscroll-behavior-y: none`), tap highlight elimination, and selective text copying rules.

---

## 3. Database Architecture (`schema.sql`)
Custom schema `dokdo_guardians` is used for total isolation:
- `dokdo_guardians.profiles`: User metadata, affiliation, license grade, role (`USER`, `ADMIN`, `RESEARCHER`).
- `dokdo_guardians.archive_posts`: Archive posts. `board_type` matches the archive tabs: `notice` (공지사항, admin-only via RLS), `dokdo` (독도 자료), `cleanup` (수중 정화 활동); legacy values `research`/`press`/`activity`/`default` remain allowed.
- `dokdo_guardians.archive_files`: Attached documents and image files linked to archive posts.
- `dokdo_guardians.archive_comments`: Comments and discussions on archive posts.
- `dokdo_guardians.cleanup_requests`: Coastal cleanup / plogging volunteer signups.
- `dokdo_guardians.cleanup_files`: Attached registration proof files.
- `dokdo_guardians.reports`: Citizen marine ecosystem / trash / hazard reports.
- `dokdo_guardians.report_files`: Attached photo and GPS media for citizen reports.
- `dokdo_guardians.contacts`: 1:1 user inquiries.

### DDL & Security Principles:
- **No `ALTER DEFAULT PRIVILEGES`**: Strictly prohibited to avoid unintended global privilege overrides across Supabase system (`auth`, `storage`) or other schemas.
- **Explicit Direct `GRANT` Only**: Always grant permissions explicitly on the custom schema, its tables, sequences, and routines.
- **Integrated Storage Initialization**: Storage bucket (`guardians-storage`) creation and storage RLS policies must be maintained directly within `schema.sql`.
- **Live DB changes go through `migrations/`**: `schema.sql` drops and recreates tables, so never run it on production. Apply incremental, re-runnable SQL files from `migrations/` in the SQL Editor and mirror the same change in `schema.sql`.

### RLS Model (`migrations/2026-10-06_rls_and_account_deletion.sql`)
- `dokdo_guardians.is_admin()` (SECURITY DEFINER) is the single admin check used by all policies.
- `profiles`: read/update own row or admin; `role`/`email` changes blocked for non-admins by trigger `protect_profile_fields`; inserts only via RPC `create_my_profile()` (role forced to `USER`).
- `archive_posts`: public rows readable by all, private rows by author/admin; insert by signed-in members as themselves (notices admin-only); update/delete by author/admin; view counter via RPC `increment_post_views()`.
- `content_reports`: members insert their own reports, only admins read/delete. `user_blocks`: each member reads/writes only their own rows.
- `archive_files` / `archive_comments`: follow parent post visibility; comments require login.
- `reports`, `cleanup_requests`, `contacts` (+ file tables): anyone can insert, only admins read/update/delete. Clients generate the row id (`crypto.randomUUID()`) because submitters cannot read rows back.
- Storage `guardians-storage`: public read and upload, update/delete admin only.
- Uploads go through `src/lib/storageUpload.ts` only: images are resized client-side (`optimizeImage.ts`: longest side 2000px, JPEG 85%, EXIF/GPS stripped; GIF/undecodable files unchanged), storage keys are generated ASCII names (Supabase rejects Korean keys; the original name is kept in the `name` column), and the per-file limit is 50MB (Supabase free plan). Services return the names of files that failed so pages can tell the user.
- Signup duplicate check uses RPC `email_exists()` instead of reading `profiles`.

---

## 4. Environment Variables (`.env.example`)
| Key | Description | Acquisition |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project API URL | Supabase Dashboard > Project Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Public Anon API Key | Supabase Dashboard > Project Settings > API > Project API Keys (`anon public`) |
| `VITE_SUPABASE_SCHEMA` | Isolated PostgreSQL Schema | Default: `dokdo_guardians` |
| `VITE_SUPABASE_STORAGE_BUCKET`| File Storage Bucket Name | Default: `guardians-storage` |

---

## 5. Brand Assets & App Icons
- **Design Motif**: Iconic Dokdo Island Twin Peaks on a Deep Ocean Blue Wave Bowl with Flying Seagulls and Proud South Korean Taegeukgi Flag (National Marine Heritage Vector Symbol).
- **Master Assets**: `assets/icon.png` (1024x1024, opaque cream square with the Dokdo emblem, no transparency) = `public/icon.png` (web favicon / apple-touch-icon), plus `public/favicon.png`. The legacy Android launcher icons (`ic_launcher`, `ic_launcher_round`) and `play-store/icon-512.png` are derived from it.
- **iOS AppIcon**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024x1024 Universal).
- **Android Launcher Icons**:
  - Legacy & Standard: `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher.png`
  - Circular Launcher: `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_round.png`
  - Adaptive Foreground: `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_foreground.png`
  - Adaptive Background: `android/app/src/main/res/values/ic_launcher_background.xml` (`#F5F6F0`)

---

## 6. Development & Deployment Roadmap
1. **Web + Database Layer (Completed)**:
   - Supabase PostgreSQL schema DDL and Seed data.
   - Fully typed TypeScript service layer (`authService`, `archiveService`, `cleanupService`, `contactService`, `reportService`).
   - Seamless fallback for offline/demo development mode.
2. **Mobile Packaging & App Icons (Completed)**:
   - Capacitor configuration (`capacitor.config.ts`), 3D Dokdo & Ocean brand icons across all Android densities.
   - Verified `npm run build` and `npm run cap:sync`.
3. **Git Versioning & Base Commit (Next Step)**:
   - Ready for GitHub repository upload.

