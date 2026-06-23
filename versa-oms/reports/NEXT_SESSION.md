# Versa OMS — Next Session Plan

Session 1 (2026-06-22) ended at "discuss/plan only". No spec content was rewritten.
The clean tree `versa-oms/` and `reports/VALIDATION_REPORT.md` are the starting point.

## Locked decisions
- Stack: **Next.js + Supabase (Postgres + RLS)**.
- Build order: **Company Portal (internal staff) first**.
- Shared tables (exam_slots, certificates, results, students, schools, payments, participations):
  **olympiad/core owns the entity; company ops modules reference via FK**.
- Traceability: **graft** codex per-field metadata (security_level, source_question_id,
  build_instruction) onto the clean individual-pack schemas.

## Next session — Step 1: build the canonical data model (READ-ONLY output)
Produce `versa-oms/implementation/CANONICAL_DATA_MODEL.json` WITHOUT overwriting per-module
`schema.json` files. Algorithm:
1. Start from olympiad core tables (clean types from individual packs).
2. Add company ops tables (clean company schemas).
3. For the 7 shared tables, keep the core/olympiad definition; replace company re-declarations
   with an FK reference.
4. Graft codex metadata (security_level/source_question_id/build_instruction) per field.
5. Emit: table list, columns (atomic Postgres types), FKs, enums (from allowed_values),
   common_fields (id/created_at/updated_at/created_by/status/archived_at/version), and a
   per-table data_classification + RLS hint pulled from RLS_POLICY_MATRIX.json + FIELD_MASKING_MATRIX.json.
6. Validate: every per-module schema.json field must map to a canonical column (report mismatches).

Then pause for review before generating any Postgres DDL or code.

## Step 2 (after model approved): Directus→Supabase ADR + DDL + RLS stubs
- ADR resolving stack + relationship-notation translation (`many-to-one:X` → FK).
- Generate additive Postgres migrations + RLS policy stubs from the canonical model.

## Step 3: real foundation layer on Supabase
Replace the skeleton stubs: auth/session, requireStaffScope/requireSchoolScope, audit writer
(append-only), idempotency store, field masking, signed URLs, response envelope.

## Step 4: first module end-to-end vertical slice
`staff_users` + `roles_permissions` (everything else depends on auth/roles) → migration →
service → routes → UI → tests passing. Prove the pipeline before the module loop.

## Housekeeping
- `_staging/` (scratch) can be deleted once rewrites are done.
- Original `*.zip` packs are the backup; keep until the tree is trusted.
