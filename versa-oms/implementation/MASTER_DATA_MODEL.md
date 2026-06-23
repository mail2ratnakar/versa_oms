# MASTER_DATA_MODEL.md — Versa Olympiads Production Master Data Model

## Purpose
Consolidates the completed school, student and company-side specs into one implementation data model so the LLM does not invent duplicate schemas.

## Core Principles
- One canonical collection per business concept.
- Source module owns mutations.
- Cross-module reads use safe views/summaries.
- Browser-submitted role, scope, school_id, status, approval, score, rank, payment state and certificate state are never trusted.
- Business and audit records are never hard-deleted.
- Use archive, void, revoke, supersede, correct or expire instead.
- Every lifecycle transition writes an audit event.
- Sensitive files are private and exposed only via short-lived signed URLs.

## Entity Layers
- Identity/access: staff, roles, permissions, sessions, scopes, approvals.
- School/student: schools, contacts, onboarding, roster batches, students, candidate IDs.
- Finance/exam: invoices, payments, slots, materials, approvals, downloads.
- Logistics/evaluation: couriers, shipments, imports, answer keys, responses, scores.
- Results/certificates: result batches, rank snapshots, corrections, templates, certificates, verification.
- Operating layer: notifications, support tickets, tasks, reports, settings.
- Security/audit: audit events, login events, incidents, alerts, access reviews, drift findings, forensics.

## Canonical Module-to-Collection Map
### 1. `company_dashboard` — Company Dashboard
Route: `/staff/dashboard` | Risk: **medium**

- `dashboard_widgets`
- `dashboard_alerts`
- `dashboard_saved_views`
- `dashboard_events`
### 2. `staff_users` — Staff Users
Route: `/staff/admin/users` | Risk: **critical**

- `staff_profiles`
- `staff_invites`
- `staff_sessions`
- `staff_scope_assignments`
- `staff_events`
### 3. `roles_permissions` — Roles & Permissions
Route: `/staff/admin/roles` | Risk: **critical**

- `role_definitions`
- `permission_definitions`
- `role_permission_matrix`
- `staff_role_assignments`
- `approval_policies`
- `permission_events`
### 4. `school_crm` — School CRM
Route: `/staff/schools/crm` | Risk: **medium**

- `school_leads`
- `school_lead_interactions`
- `school_lead_tasks`
- `school_lead_imports`
- `school_lead_events`
### 5. `school_onboarding_ops` — School Onboarding Ops
Route: `/staff/schools/onboarding` | Risk: **high**

- `schools`
- `school_contacts`
- `school_onboarding_cases`
- `school_documents`
- `school_activation_events`
### 6. `student_roster_ops` — Student Roster Ops
Route: `/staff/students/rosters` | Risk: **critical**

- `student_roster_batches`
- `students`
- `student_candidate_ids`
- `student_roster_errors`
- `student_roster_events`
### 7. `finance_ops` — Finance Ops
Route: `/staff/finance` | Risk: **critical**

- `invoices`
- `payment_links`
- `payment_transactions`
- `manual_payment_confirmations`
- `refunds_reversals`
- `finance_events`
### 8. `exam_slot_ops` — Exam Slot Ops
Route: `/staff/exams/slots` | Risk: **high**

- `exam_cycles`
- `exam_slots`
- `school_exam_assignments`
- `slot_reschedule_requests`
- `exam_slot_events`
### 9. `exam_material_ops` — Exam Material Ops
Route: `/staff/exams/materials` | Risk: **critical**

- `exam_material_templates`
- `exam_material_packages`
- `exam_material_files`
- `exam_material_approvals`
- `exam_material_download_events`
- `exam_material_events`
### 10. `courier_ops` — Courier Ops
Route: `/staff/courier` | Risk: **high**

- `courier_vendors`
- `courier_dispatch_batches`
- `courier_shipments`
- `courier_tracking_events`
- `courier_receipts`
- `courier_exceptions`
- `courier_events`
### 11. `evaluation_ops` — Evaluation Ops
Route: `/staff/evaluation` | Risk: **critical**

- `evaluation_answer_keys`
- `evaluation_import_batches`
- `evaluation_candidate_responses`
- `evaluation_score_batches`
- `evaluation_candidate_scores`
- `evaluation_exceptions`
- `evaluation_events`
### 12. `results_ops` — Results Ops
Route: `/staff/results` | Risk: **critical**

- `result_batches`
- `candidate_results`
- `result_publication_windows`
- `result_corrections`
- `result_rank_snapshots`
- `result_events`
### 13. `certificate_ops` — Certificate Ops
Route: `/staff/certificates` | Risk: **high**

- `certificate_templates`
- `certificate_eligibility_snapshots`
- `certificates`
- `certificate_requests`
- `certificate_download_events`
- `certificate_events`
### 14. `notification_ops` — Notification Ops
Route: `/staff/notifications` | Risk: **high**

- `notification_templates`
- `notification_triggers`
- `notification_batches`
- `notification_recipients`
- `notification_messages`
- `notification_delivery_attempts`
- `notification_preferences`
- `notification_events`
### 15. `support_tickets` — Support Tickets
Route: `/staff/support` | Risk: **medium**

- `support_ticket_categories`
- `support_tickets`
- `support_ticket_messages`
- `support_ticket_attachments`
- `support_ticket_links`
- `support_ticket_escalations`
- `support_ticket_events`
### 16. `task_work_queue` — Task Work Queue
Route: `/staff/tasks` | Risk: **medium**

- `task_queues`
- `work_tasks`
- `task_assignments`
- `task_dependencies`
- `task_comments`
- `task_sla_events`
- `task_events`
### 17. `reports_exports` — Reports & Exports
Route: `/staff/reports` | Risk: **critical**

- `report_definitions`
- `export_requests`
- `report_snapshots`
- `export_files`
- `export_download_events`
- `report_events`
### 18. `admin_settings` — Admin Settings
Route: `/staff/admin/settings` | Risk: **critical**

- `admin_setting_groups`
- `admin_settings`
- `feature_flag_settings`
- `policy_versions`
- `system_config_events`
### 19. `security_audit_console` — Security & Audit Console
Route: `/staff/security-audit` | Risk: **critical**

- `security_audit_events`
- `security_incidents`
- `security_alerts`
- `staff_login_events`
- `access_reviews`
- `permission_drift_findings`
- `forensics_cases`
- `security_events`

## Shared Field Convention
Every mutable collection should include: `id`, `created_at`, `updated_at`, `created_by`, `status`, `archived_at`, and `version` where applicable.

Append-only event collections should include: `id`, `entity_type`, `entity_id`, `event_code`, `previous_status`, `new_status`, `reason`, `actor_id`, `metadata`, `created_at`, and `event_hash` for security events.

## Status Patterns
- Draft/review: `draft → under_review → approved → active → retired → archived`.
- Operations: `new → open/queued → assigned → in_progress → completed/cancelled/archived`.
- Publication: `draft → generated → approved → published → corrected/superseded/archived`.
- File: `pending → generated → released → downloaded → revoked/expired/archived`.

## Implementation Rule
The LLM must generate migrations from `DATABASE_SCHEMA_REGISTRY.json`; it must not invent new collection names without an approved change request.
