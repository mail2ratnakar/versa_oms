# RELEASE_PROCESS.md

## 1. Release Types

- `dev`
- `staging`
- `production`
- `hotfix`
- `rollback`

## 2. Release ID Format

```text
REL-YYYYMMDD-NNN
```

## 3. Release Checklist

Every release must have:

- release id.
- commit sha.
- changelog.
- affected modules.
- migration list.
- feature flag diff.
- rollback file.
- smoke test plan.
- approver where required.

## 4. Production Release Flow

1. Generate release candidate.
2. Confirm CI passed.
3. Deploy to staging.
4. Run staging smoke tests.
5. Run migration check.
6. Confirm rollback file.
7. Confirm backup.
8. Request production approval.
9. Deploy production.
10. Run production smoke tests.
11. Monitor.
12. Lock release.

## 5. Release Lock

After release:

- tag commit.
- store release summary.
- store rollback metadata.
- store smoke result.
- update implementation manifest.
