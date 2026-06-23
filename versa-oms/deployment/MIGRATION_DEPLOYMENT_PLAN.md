# MIGRATION_DEPLOYMENT_PLAN.md

## 1. Purpose

Database migrations must be safe, auditable and reversible or forward-fixable.

## 2. Migration Rules

- Additive migrations preferred.
- Destructive migrations blocked by default.
- Every migration has id.
- Every migration has owner.
- Every migration has rollback metadata.
- Every migration is tested in staging.
- Production migrations require backup first.
- Migration failure blocks deployment.

## 3. Migration Lifecycle

```text
draft
  ↓
reviewed
  ↓
staging_applied
  ↓
staging_verified
  ↓
production_backup_verified
  ↓
production_applied
  ↓
production_verified
```

## 4. Required Migration Metadata

- migration id.
- affected collections.
- affected modules.
- backward compatible: yes/no.
- destructive: yes/no.
- data loss risk.
- rollback method.
- verification query.
- smoke test.
- approval required.

## 5. Stop Conditions

Stop if:

- destructive migration without approval.
- no rollback/forward-fix plan.
- production backup missing.
- staging migration not tested.
- migration touches results/certificates/payments without approval.
- migration changes roles/permissions without security review.

## 6. Rollback

Prefer:

- feature disable.
- forward-fix.
- old column retained.
- data supersede.

Avoid:

- dropping columns.
- deleting records.
- overwriting published records.
