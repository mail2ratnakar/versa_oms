# ADR-0001 — Specs are Directus-flavored; build target is Supabase (Postgres + RLS)

- Status: Accepted
- Date: 2026-06-23

## Context
The 30-module specs were authored with Directus in mind: relationship types use
`many-to-one:<table>` / `many-to-one <table>`, fields carry `directus_permission_note`,
and FKs reference `directus_users` / `directus_roles`. The chosen build stack is
**Next.js + Supabase (Postgres + RLS)**.

## Decision
1. **Relationship translation:** `many-to-one:X` → `uuid` column + `FK → X(id)`.
2. **Identity mapping:** `directus_users` → `staff_profiles`; `directus_roles` → `portal_roles`.
   School-side identity is `school_users`. A nullable `auth_user_id` on `staff_profiles` /
   `school_users` links to Supabase `auth.users` (wired when auth is implemented).
3. **Enums:** spec `enum` + `allowed_values` → Postgres `text` column + `CHECK (col IN (...))`
   (additive-migration friendly; statuses stay app/lifecycle-controlled `text`).
4. **Authorization:** `directus_permission_note` + `access_matrix.json` + `RLS_POLICY_MATRIX.json`
   + `FIELD_MASKING_MATRIX.json` → Postgres RLS policies + server-side guards + field masking
   (built in the foundation phase).
5. **No hard delete:** every table carries `archived_at`; deletes are archive/revoke/supersede.

## Consequences
- The canonical model (`implementation/CANONICAL_DATA_MODEL.json`) and generated DDL
  (`app/supabase/migrations/0001_schema.sql`) are pure Postgres — no Directus runtime.
- `created_by` references `staff_profiles` and is nullable (school-created rows may set a
  school actor instead; refined in foundation).
- Directus admin UI is not used; staff/school UIs are built in Next.js per the design system.
