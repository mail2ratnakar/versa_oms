# 07 — Auth RBAC Scope Skill

## Purpose

Ensures auth, staff/school separation, role/scope resolution and authorization are server-side and production-safe.

## Must Read Before Acting

- `RLS_POLICY_MATRIX.json`
- `FIELD_MASKING_MATRIX.json`
- `staff_users module`
- `roles_permissions module`
- `auth ADRs`

## Checks

- real auth wired
- dev fallback disabled in staging/prod
- staff invite-only
- school users separate
- school_id session-only
- role/scope server-side
- self-role-change blocked
- last super admin protected

## Failure Signals

- x-demo-staff works in production
- browser school_id trusted
- disabled user accesses API

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
