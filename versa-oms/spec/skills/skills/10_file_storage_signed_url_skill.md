# 10 — File Storage Signed URL Skill

## Purpose

Ensures sensitive files use private storage, scoped short-lived signed URLs, download audit, expiry and revocation.

## Must Read Before Acting

- `SIGNED_URL_RESPONSE_CONVENTION.md`
- `exam_material_ops module`
- `reports_exports module`
- `certificate_ops module`

## Checks

- private storage
- no raw file paths
- short-lived signed URLs
- download permission check
- download audit
- expiry/revocation
- URLs not logged

## Failure Signals

- demo signed URL remains
- public bucket used
- download not audited

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
