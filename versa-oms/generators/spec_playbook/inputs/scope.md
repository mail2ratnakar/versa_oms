# Scope

Build a reusable specification-generation pipeline for Versa Olympiads and its Company/Internal Portal.

The pipeline must convert a brief product scope into a questionnaire, answers, source-of-truth CSV, module registry, per-module semantic JSON/MD specification packs, validation reports, package manifests, ZIP files and completed-vs-pending summaries.

The current Company Portal state is:

Completed:
- company_dashboard
- staff_users
- roles_permissions
- school_crm
- school_onboarding_ops
- student_roster_ops
- finance_ops

Pending:
- exam_slot_ops
- exam_material_ops
- courier_ops
- evaluation_ops
- results_ops
- certificate_ops
- notification_ops
- support_tickets
- task_work_queue
- reports_exports
- admin_settings
- security_audit_console

Every module must follow the same 14-parameter semantic spec playbook.
