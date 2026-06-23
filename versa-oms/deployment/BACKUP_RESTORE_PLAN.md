# BACKUP_RESTORE_PLAN.md

## 1. Purpose

Production release requires backup and restore readiness.

## 2. Backup Requirements

Before production deployment:

- database backup confirmed.
- private storage backup policy confirmed.
- migration backup point recorded.
- release id attached.
- backup location verified.

## 3. Backup Schedule

Recommended:

- database: daily automated backup.
- critical release backup: before production migration.
- private files: provider-level versioning or backup.
- audit records: long retention.

## 4. Restore Drill

Staging restore drill must verify:

- database can restore.
- app can boot after restore.
- migrations can reapply or skip safely.
- audit records are readable.
- file metadata remains consistent.
- smoke tests pass.

## 5. Restore Stop Conditions

Do not deploy production if:

- restore process is unknown.
- backup failed.
- backup location cannot be accessed.
- migration rollback is unclear.
- smoke tests after restore fail.

## 6. Recovery Priorities

1. Auth and staff access.
2. School portal access.
3. Payment/finance integrity.
4. Exam material integrity.
5. Evaluation/results integrity.
6. Certificates and public verification.
7. Reports/exports.
8. Support/tasks.
