# School CRM Module Runbook

## Purpose
Build the School CRM module after Roles & Permissions because sales and operations staff need scoped permissions before lead management.

## Required order
1. Confirm `staff_users` and `roles_permissions` exist.
2. Create `school_leads`, `school_lead_interactions`, `school_lead_import_batches`, and append-only `school_lead_stage_events`.
3. Configure staff-only permissions and deny public/school access.
4. Implement lead owner and assignment-scope guards.
5. Implement duplicate detection and lead-stage transition guards.
6. Implement follow-up task integration.
7. Implement lead import validation and commit workflow.
8. Implement lead-to-school conversion through `school_onboarding_ops`.
9. Implement APIs and screens defined in this module.
10. Run tests in `tests.json`.

## Stop conditions
Stop if public/school roles can read CRM leads, sales staff can see unassigned leads, duplicates can convert, lost reason is not required, import files are public, converted lead lacks converted_school_id, or hard delete is enabled.

## Change continuity
All future School CRM changes must use feature_request_template.json, bug_fix_template.json, change_control.json, versioning_policy.json and regression tests.
