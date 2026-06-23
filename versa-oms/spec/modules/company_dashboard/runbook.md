# Company Dashboard Module Runbook

## Purpose

Build the Company Dashboard module first in the company portal sequence because it is the internal landing page and command center.

## Required order

1. Confirm company portal authentication exists.
2. Confirm staff role model exists or stub role mapping for MVP.
3. Create dashboard collections:
   - `dashboard_preferences`
   - `dashboard_alert_dismissals`
   - `dashboard_snapshots`
4. Implement server-side dashboard aggregators.
5. Implement widget permission guard.
6. Implement role-aware views.
7. Implement assignment scope filtering.
8. Implement critical alert safe-summary policy.
9. Implement APIs:
   - `GET /api/staff/dashboard/overview`
   - `GET /api/staff/dashboard/command-center`
   - `GET /api/staff/dashboard/widgets/{widget_id}`
   - `POST /api/staff/dashboard/preferences`
   - `POST /api/staff/dashboard/alerts/{alert_id}/dismiss`
10. Implement screens:
   - `/staff/dashboard`
   - `/staff/dashboard/command-center`
   - `/staff/dashboard/finance`
   - `/staff/dashboard/evaluation`
   - `/staff/dashboard/security`
11. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Public role can access any dashboard route.
- Dashboard returns cross-school data to assigned-scope staff.
- Any dashboard tile exposes raw OMR, answer keys, provider secrets, private file URLs or audit snapshots.
- Dashboard cache is not scoped by role/scope/filter.
- Drilldown bypasses target module permission.
- Alert dismissal resolves the underlying source issue.
- More than two repair attempts fail.

## Change continuity

All future dashboard changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
