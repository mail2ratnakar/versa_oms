# Canonical Data Model (all 30 modules)

- Tables: **131**  ·  Stack: Next.js + Supabase (Postgres + RLS)
- Shared-table resolutions: 21  ·  Dangling FK targets: 0

## Shared tables (declared in >1 module — core owner chosen)
- `access_reviews` — owner **audit** (declared in: audit, security_audit_console)
- `audit_events` — owner **core** (declared in: audit, core)
- `certificate_events` — owner **certificates** (declared in: certificate_ops, certificates)
- `certificate_templates` — owner **certificates** (declared in: certificate_ops, certificates)
- `certificates` — owner **core** (declared in: certificate_ops, certificates, core)
- `courier_batches` — owner **core** (declared in: courier, core)
- `courier_events` — owner **courier** (declared in: courier, courier_ops)
- `exam_materials` — owner **core** (declared in: exam_materials, core)
- `exam_slots` — owner **core** (declared in: exam_slot_ops, exam_slots, core)
- `notification_events` — owner **notifications** (declared in: notification_ops, notifications)
- `notification_preferences` — owner **notifications** (declared in: notification_ops, notifications)
- `notification_templates` — owner **notifications** (declared in: notification_ops, notifications)
- `omr_imports` — owner **core** (declared in: omr_imports, core)
- `participations` — owner **core** (declared in: schools, students, core)
- `payments` — owner **core** (declared in: payments, core)
- `result_corrections` — owner **results** (declared in: results, results_ops)
- `results` — owner **core** (declared in: results, core)
- `school_users` — owner **core** (declared in: schools, core)
- `schools` — owner **core** (declared in: schools, core)
- `security_incidents` — owner **audit** (declared in: audit, security_audit_console)
- `students` — owner **core** (declared in: students, core)

## Dangling FK targets (referenced but no table defines them)
- none

## Tables by module

### admin_settings (company) — 6 tables
- `admin_setting_events` (10 cols)
- `setting_activation_events` (8 cols)
- `setting_change_requests` (12 cols)
- `setting_definitions` (14 cols)
- `setting_groups` (9 cols)
- `setting_versions` (13 cols)

### audit (olympiads) — 5 tables
- `access_reviews` (11 cols)
- `audit_cases` (15 cols)
- `audit_exports` (10 cols)
- `reconciliation_runs` (13 cols)
- `security_incidents` (19 cols)

### certificate_ops (company) — 3 tables
- `certificate_download_events` (9 cols)
- `certificate_eligibility_snapshots` (12 cols)
- `certificate_requests` (12 cols)

### certificates (olympiads) — 2 tables
- `certificate_events` (11 cols)
- `certificate_templates` (11 cols)

### company_dashboard (company) — 3 tables
- `dashboard_alert_dismissals` (7 cols)
- `dashboard_preferences` (8 cols)
- `dashboard_snapshots` (8 cols)

### core (core) — 13 tables
- `audit_events` (13 cols)
- `certificates` (12 cols)
- `courier_batches` (14 cols)
- `exam_materials` (11 cols)
- `exam_slots` (13 cols)
- `olympiads` (14 cols)
- `omr_imports` (11 cols)
- `participations` (14 cols)
- `payments` (14 cols)
- `results` (14 cols)
- `school_users` (6 cols)
- `schools` (15 cols)
- `students` (14 cols)

### courier (olympiads) — 1 tables
- `courier_events` (11 cols)

### courier_ops (company) — 6 tables
- `courier_dispatch_batches` (13 cols)
- `courier_exceptions` (13 cols)
- `courier_receipts` (13 cols)
- `courier_shipments` (13 cols)
- `courier_tracking_events` (7 cols)
- `courier_vendors` (13 cols)

### evaluation_ops (company) — 7 tables
- `evaluation_answer_keys` (14 cols)
- `evaluation_candidate_responses` (10 cols)
- `evaluation_candidate_scores` (12 cols)
- `evaluation_events` (10 cols)
- `evaluation_exceptions` (14 cols)
- `evaluation_import_batches` (19 cols)
- `evaluation_score_batches` (15 cols)

### exam_material_ops (company) — 6 tables
- `exam_material_approvals` (11 cols)
- `exam_material_download_events` (12 cols)
- `exam_material_events` (11 cols)
- `exam_material_files` (11 cols)
- `exam_material_packages` (22 cols)
- `exam_material_templates` (12 cols)

### exam_materials (olympiads) — 1 tables
- `exam_material_downloads` (11 cols)

### exam_slot_ops (company) — 5 tables
- `exam_cycles` (16 cols)
- `exam_slot_conflicts` (9 cols)
- `exam_slot_events` (11 cols)
- `exam_slot_reschedule_requests` (14 cols)
- `school_exam_slot_assignments` (21 cols)

### exam_slots (olympiads) — 1 tables
- `exam_slot_bookings` (15 cols)

### finance_ops (company) — 6 tables
- `finance_adjustments` (14 cols)
- `finance_events` (12 cols)
- `finance_invoices` (23 cols)
- `finance_payment_links` (13 cols)
- `finance_payments` (18 cols)
- `finance_reconciliation_batches` (12 cols)

### notification_ops (company) — 5 tables
- `notification_batches` (17 cols)
- `notification_delivery_attempts` (10 cols)
- `notification_messages` (13 cols)
- `notification_recipients` (11 cols)
- `notification_triggers` (12 cols)

### notifications (olympiads) — 4 tables
- `notification_deliveries` (24 cols)
- `notification_events` (12 cols)
- `notification_preferences` (9 cols)
- `notification_templates` (14 cols)

### omr_imports (olympiads) — 2 tables
- `answer_keys` (12 cols)
- `omr_candidate_scores` (14 cols)

### payments (olympiads) — 1 tables
- `payment_events` (12 cols)

### reports_exports (company) — 6 tables
- `export_download_events` (9 cols)
- `export_files` (11 cols)
- `export_requests` (14 cols)
- `report_definitions` (13 cols)
- `report_events` (10 cols)
- `report_snapshots` (11 cols)

### results (olympiads) — 2 tables
- `result_corrections` (9 cols)
- `result_publications` (15 cols)

### results_ops (company) — 5 tables
- `candidate_results` (22 cols)
- `result_batches` (17 cols)
- `result_events` (11 cols)
- `result_publication_windows` (10 cols)
- `result_rank_snapshots` (9 cols)

### roles_permissions (company) — 4 tables
- `approval_policies` (12 cols)
- `portal_permission_rules` (16 cols)
- `portal_roles` (13 cols)
- `role_change_requests` (13 cols)

### school_crm (company) — 4 tables
- `school_lead_import_batches` (15 cols)
- `school_lead_interactions` (13 cols)
- `school_lead_stage_events` (9 cols)
- `school_leads` (35 cols)

### school_onboarding_ops (company) — 4 tables
- `school_onboarding_cases` (33 cols)
- `school_onboarding_documents` (10 cols)
- `school_onboarding_events` (9 cols)
- `school_status_controls` (11 cols)

### security_audit_console (company) — 6 tables
- `forensics_cases` (11 cols)
- `permission_drift_findings` (11 cols)
- `security_alerts` (12 cols)
- `security_audit_events` (19 cols)
- `security_events` (10 cols)
- `staff_login_events` (11 cols)

### staff_users (company) — 4 tables
- `staff_access_events` (12 cols)
- `staff_assignment_scopes` (12 cols)
- `staff_invitations` (14 cols)
- `staff_profiles` (26 cols)

### student_roster_ops (company) — 4 tables
- `candidate_id_events` (11 cols)
- `student_roster_batches` (21 cols)
- `student_roster_corrections` (15 cols)
- `student_roster_events` (9 cols)

### students (olympiads) — 1 tables
- `student_uploads` (15 cols)

### support_tickets (company) — 7 tables
- `support_ticket_attachments` (11 cols)
- `support_ticket_categories` (11 cols)
- `support_ticket_escalations` (12 cols)
- `support_ticket_events` (9 cols)
- `support_ticket_links` (9 cols)
- `support_ticket_messages` (11 cols)
- `support_tickets` (19 cols)

### task_work_queue (company) — 7 tables
- `task_assignments` (9 cols)
- `task_comments` (8 cols)
- `task_dependencies` (10 cols)
- `task_events` (9 cols)
- `task_queues` (12 cols)
- `task_sla_events` (8 cols)
- `work_tasks` (22 cols)