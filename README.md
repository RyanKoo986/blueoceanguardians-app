# 🌊 Blue Guardians

> A cross-platform civic participation app for marine ecosystem conservation, real-time ocean hazard reporting, and coastal cleanup coordination centered on the Dokdo Islands and the East Sea.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Mobile Build](#mobile-build)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

**Blue Guardians (블루 가디언즈)** is a web and mobile application supporting:

- 🦈 **Marine Ecosystem Archive** — Research papers, press releases, and activity reports
- 🗺️ **Real-time Citizen Reports** — Ocean pollution, marine hazards, and illegal dumping reports with GPS & photo attachments
- 🏖️ **Coastal Cleanup Coordination** — Beachcombing and plogging volunteer signup management
- 🤖 **AI Fact-Check Engine** — GPT-4o powered historical fact verification and text refinement for Dokdo-related content
- 👤 **Role-based Access Control** — Guest, User, Researcher, and Admin tiers

---

## Features

| Feature | Description |
|---|---|
| Guest Access | Browse all articles, reports, and archives without login |
| Biometric Login | Fingerprint & Face ID via WebAuthn / native Capacitor |
| AI Fact-Check | Real-time GPT-4o fact verification with offline mock fallback |
| Research Archive | Upload, categorize, and comment on official documents |
| Hazard Reporting | Submit geo-tagged photo reports of marine threats |
| Cleanup Signup | Volunteer registration with file attachment support |
| Admin Dashboard | Moderate posts, reports, and user roles |
| Privacy Policy | Standalone `/privacy` route — compliant with Play Store & App Store |
| Account Deletion | In-app permanent account deletion (App Store Guideline 5.1.1(v)) |
| i18n Ready | Korean & English via i18next |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Routing | React Router DOM v6 |
| Styling | TailwindCSS, Framer Motion, Lucide React |
| Backend | Supabase (PostgreSQL 15+, Storage, Auth, RLS) |
| Mobile | Capacitor v8 (Android & iOS) |
| AI | OpenAI GPT-4o |
| i18n | i18next, react-i18next |

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A [Supabase](https://supabase.com) account and project
- *(Optional)* An [OpenAI](https://platform.openai.com) API key for AI features
- *(Android builds)* [Android Studio](https://developer.android.com/studio) + JDK 17
- *(iOS builds)* macOS with [Xcode](https://developer.apple.com/xcode/) 15+

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/blueoceanguardians-app.git
cd blueoceanguardians-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase and OpenAI credentials (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

Run `schema.sql` in your Supabase project's **SQL Editor**:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project
2. Go to **SQL Editor** → **New Query**
3. Paste the entire contents of `schema.sql` and click **Run**

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and populate each value:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SCHEMA=dokdo_guardians
VITE_SUPABASE_STORAGE_BUCKET=guardians-storage
VITE_OPENAI_API_KEY=sk-proj-...        # Optional — runs in mock mode if omitted
```

| Variable | Description | Where to find |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project API URL | Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Dashboard → Project Settings → API → `anon public` |
| `VITE_SUPABASE_SCHEMA` | Custom DB schema name | Default: `dokdo_guardians` |
| `VITE_SUPABASE_STORAGE_BUCKET` | Storage bucket name | Create in Supabase Storage (public bucket) |
| `VITE_OPENAI_API_KEY` | OpenAI secret key | [platform.openai.com](https://platform.openai.com) → API Keys |

> **Note:** If `VITE_OPENAI_API_KEY` is omitted, the AI fact-check feature automatically falls back to a local mock engine — the rest of the app works normally.

---

## Database Setup

The database uses a custom PostgreSQL schema `dokdo_guardians` for full isolation from Supabase system tables.

### Core tables

| Table | Purpose |
|---|---|
| `profiles` | User metadata, license grade, role |
| `archive_posts` | Research papers, notices, activity reports |
| `archive_files` | Attachments linked to archive posts |
| `archive_comments` | Discussions on archive posts |
| `cleanup_requests` | Coastal cleanup volunteer signups |
| `cleanup_files` | Signup proof file attachments |
| `reports` | Citizen marine hazard / pollution reports |
| `report_files` | Photo & GPS media for reports |
| `contacts` | 1:1 user inquiries |

Run `schema.sql` in the Supabase SQL Editor to create all tables, RLS policies, and the storage bucket in one step.

---

## Mobile Build

This project uses **Capacitor v8** for native Android and iOS packaging.

### Android (Windows / Mac / Linux)

```bash
npm run build          # Build web bundle -> dist/
npx cap sync android   # Sync to Android native project
npm run cap:android    # Open Android Studio
```

In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**

### iOS (macOS + Xcode only)

```bash
npm run build
npx cap sync ios
npm run cap:ios        # Open Xcode
```

In Xcode: **Product → Archive → Distribute App**

> **Warning:** iOS builds require a physical macOS machine or cloud Mac instance. Building iOS apps on Windows is not supported by Apple's toolchain.

For full deployment instructions, see [`MOBILE_DEPLOYMENT_GUIDE.md`](./MOBILE_DEPLOYMENT_GUIDE.md).

---

## Project Structure

```
blueoceanguardians-app/
├── src/
│   ├── components/       # Shared UI components
│   ├── context/          # React Context (AuthContext)
│   ├── pages/            # Route-level page components
│   │   ├── home/         # Landing page sections
│   │   ├── admin/        # Admin dashboard
│   │   └── ...
│   ├── services/         # Supabase service layer (auth, archive, reports, etc.)
│   └── i18n/             # Translation files (ko, en)
├── android/              # Capacitor Android native project
├── ios/                  # Capacitor iOS native project
├── assets/               # Master brand icon assets
├── public/               # Static assets served at root
├── schema.sql            # PostgreSQL DDL — run once in Supabase SQL Editor
├── capacitor.config.ts   # Capacitor configuration
├── .env.example          # Environment variable template
├── PROJECT.md            # Architecture & decisions log
└── task.md               # Feature roadmap & progress tracker
```

---

## Deployment

### Web (AWS Amplify)

The project includes `amplify.yml` for zero-config deployment on [AWS Amplify](https://aws.amazon.com/amplify/):

1. Connect your GitHub repository in the Amplify Console
2. Set all `VITE_*` environment variables in **App Settings → Environment Variables**
3. Amplify auto-builds and deploys on every push to `main`

The live Privacy Policy URL (`https://your-domain/privacy`) is required for both Google Play Console and App Store Connect submissions.

---

## License

This project is intended for non-profit civic and educational use in support of Korean marine conservation efforts.
