# Database Management & Schema Rules

## PostgreSQL & Supabase DDL Rules
1. **Schema Isolation**:
   - Always isolate tables in a dedicated custom schema (e.g. `dokdo_guardians`).
2. **Explicit Permissions (No `ALTER DEFAULT PRIVILEGES`)**:
   - **NEVER use `ALTER DEFAULT PRIVILEGES`** in DDL scripts. It can unintentionally modify global default privileges across the database instance (affecting `auth`, `storage`, and other system/project schemas).
   - **ALWAYS use explicit direct `GRANT` statements** targeted strictly to the custom schema and its tables/sequences:
     ```sql
     GRANT USAGE ON SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
     GRANT ALL ON ALL TABLES IN SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
     GRANT ALL ON ALL SEQUENCES IN SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
     GRANT ALL ON ALL ROUTINES IN SCHEMA dokdo_guardians TO postgres, anon, authenticated, service_role;
     ```
3. **Safe Resets & Storage Automation**:
   - Safe table drops using `DROP TABLE IF EXISTS ... CASCADE`.
   - Include Storage bucket initialization (`INSERT INTO storage.buckets ... ON CONFLICT DO UPDATE`) and storage RLS policies directly in `schema.sql`.
