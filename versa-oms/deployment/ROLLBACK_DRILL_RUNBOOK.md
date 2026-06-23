# ROLLBACK_DRILL_RUNBOOK.md

## 1. Purpose

Rollback drills ensure production rollback is real, not theoretical.

## 2. When to Run

- Before first production release.
- Before major schema release.
- Before payment/result/certificate release.
- Quarterly after production.

## 3. Drill Types

### Feature Flag Rollback

- Enable feature in staging.
- Verify feature works.
- Disable flag.
- Confirm route/action blocked.
- Confirm audit event created.

### Code Rollback

- Deploy staging build.
- Redeploy previous build.
- Run smoke tests.
- Confirm release id changed.

### Migration Rollback / Forward Fix

- Apply staging migration.
- Apply rollback or forward-fix.
- Verify data.
- Run smoke tests.

### Signed URL Revocation

- Generate signed URL.
- Revoke/expire policy.
- Confirm download blocked.
- Confirm audit.

### Sensitive Export Rollback

- Generate export.
- Expire export file.
- Confirm metadata preserved.
- Confirm download blocked.

## 4. Drill Result

Record:

- drill id.
- date.
- release id.
- owner.
- steps executed.
- pass/fail.
- issues found.
- corrective action.
