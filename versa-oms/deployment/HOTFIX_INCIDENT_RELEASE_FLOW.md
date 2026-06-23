# HOTFIX_INCIDENT_RELEASE_FLOW.md

## 1. Purpose

Define minimal safe flow for emergency fixes.

## 2. Hotfix Rules

- Fix only the incident.
- No unrelated refactor.
- No new feature.
- Add regression test.
- Update rollback.
- Run targeted tests.
- Require approval if production.

## 3. Security Incident Hotfix

If security-related:

1. Disable affected feature flag.
2. Revoke sessions if needed.
3. Rotate secrets if needed.
4. Patch.
5. Test.
6. Deploy staging.
7. Approve production.
8. Deploy production.
9. Create postmortem.
10. Update threat model.
