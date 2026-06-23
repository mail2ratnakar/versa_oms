# Company Portal Source-of-Truth — Completed vs Pending Summary

## Completed

- Answered all 200 company/internal portal questionnaire items.
- Generated source-of-truth CSV.
- Generated JSON copy of source-of-truth.
- Generated readable Markdown answer document.
- Generated company portal module registry CSV/JSON.
- Encoded rule: each later company portal module must follow the same 14-parameter semantic spec structure.

## Company Portal Modules Pending for Later Generation

1. company_dashboard
2. staff_users
3. roles_permissions
4. school_crm
5. school_onboarding_ops
6. student_roster_ops
7. finance_ops
8. exam_slot_ops
9. exam_material_ops
10. courier_ops
11. evaluation_ops
12. results_ops
13. certificate_ops
14. notification_ops
15. support_tickets
16. task_work_queue
17. reports_exports
18. admin_settings
19. security_audit_console

## Next Recommended Module

**company_dashboard**

## Rule to Preserve

Every company portal module must include the standard semantic module files:

- module.json
- schema.json
- workflows.json
- messages.json
- validations.json
- screens.json
- permissions.json
- security.json
- data_classification.json
- access_matrix.json
- dependency_map.json
- lifecycle_states.json
- change_control.json
- versioning_policy.json
- feature_request_template.json
- bug_fix_template.json
- tests.json
- runbook.md
- final_modular_design.md

Additional policy files can be added per module when required.
