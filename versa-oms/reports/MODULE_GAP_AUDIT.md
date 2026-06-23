# Module Gap Audit (mechanical, spec-grounded, both portals)

Supersedes the heuristic source_of_truth_audit. Reconciles workflows.json transitions vs implemented service transitions (by target status).

**Totals:** 53/441 declared transitions implemented (12%); 388 missing.
**School portal action routes present:** NO  ·  **Staff:** YES
**School-facing entities with any implemented action:** 3/15

## Per module (worst first)

| Module | transitions impl/declared | % | features |
|---|--:|--:|--:|
| admin_settings | 0/14 | 0% | 6 |
| audit | 0/18 | 0% | 7 |
| courier_ops | 0/10 | 0% | 8 |
| payments | 0/8 | 0% | 6 |
| reports_exports | 0/20 | 0% | 7 |
| school_crm | 0/17 | 0% | 7 |
| security_audit_console | 0/28 | 0% | 7 |
| students | 0/5 | 0% | 6 |
| support_tickets | 0/21 | 0% | 7 |
| task_work_queue | 0/21 | 0% | 7 |
| evaluation_ops | 1/23 | 4% | 6 |
| exam_material_ops | 1/19 | 5% | 8 |
| notification_ops | 1/22 | 5% | 7 |
| finance_ops | 1/17 | 6% | 6 |
| roles_permissions | 1/15 | 7% | 6 |
| notifications | 1/12 | 8% | 6 |
| company_dashboard | 1/9 | 11% | 5 |
| omr_imports | 1/8 | 12% | 5 |
| staff_users | 2/13 | 15% | 6 |
| results_ops | 4/24 | 17% | 6 |
| exam_slot_ops | 4/21 | 19% | 7 |
| student_roster_ops | 3/15 | 20% | 6 |
| exam_slots | 2/8 | 25% | 4 |
| schools | 2/8 | 25% | 4 |
| certificate_ops | 5/19 | 26% | 7 |
| results | 4/13 | 31% | 6 |
| certificates | 5/10 | 50% | 6 |
| exam_materials | 4/7 | 57% | 5 |
| school_onboarding_ops | 6/10 | 60% | 7 |
| courier | 4/6 | 67% | 5 |

## Gap detail (entities with missing transitions or no service)

### admin_settings (0/14 transitions)
    - `setting_definitions`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'retired', 'under_review']
    - `setting_versions`: 0/6 transitions impl (service: NONE) — MISSING ['active', 'approved', 'rolled_back', 'scheduled', 'superseded', 'under_review']
    - `setting_change_requests`: 0/5 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'rejected', 'submitted', 'under_review']
### audit (0/18 transitions)
    - `audit_events`: 0/3 transitions impl (service: NONE) — MISSING ['archived', 'flagged', 'reviewed']
    - `audit_cases`: 0/5 transitions impl (service: NONE) — MISSING ['closed', 'in_review', 'open', 'reopened', 'resolved']
    - `security_incidents`: 0/6 transitions impl (service: NONE) — MISSING ['closed', 'contained', 'open', 'remediated', 'reopened', 'triaged']
    - `reconciliation_runs`: 0/4 transitions impl (service: NONE) — MISSING ['closed', 'exceptions_found', 'passed', 'running']
### certificate_ops (5/19 transitions)
    - `certificate_templates`: 1/4 transitions impl (service: staff) — MISSING ['active', 'retired', 'under_review']
    - `certificates`: 4/8 transitions impl (service: school+staff) — MISSING ['downloaded', 'reissue_requested', 'reissued', 'under_review']
    - `certificate_requests`: 0/5 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'rejected', 'submitted', 'under_review']
    - `certificates`: 0/2 transitions impl (service: school+staff) — MISSING ['verification_active', 'verification_revoked']
### certificates (5/10 transitions)
    - `certificate_templates`: 1/3 transitions impl (service: staff) — MISSING ['active', 'superseded']
    - `certificates`: 4/7 transitions impl (service: school+staff) — MISSING ['downloaded', 'superseded', 'verified']
### company_dashboard (1/9 transitions)
    - `dashboard_runtime`: 0/4 transitions impl (service: NONE) — MISSING ['role_resolved', 'scope_applied', 'view_rendered', 'widgets_loaded']
    - `dashboard_alert`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'dismissed_by_user', 'source_resolved']
    - `dashboard_preferences`: 1/2 transitions impl (service: staff) — MISSING ['updated']
### courier (4/6 transitions)
    - `courier_batches`: 4/6 transitions impl (service: staff) — MISSING ['ready_for_dispatch', 'received_or_count_mismatch']
### courier_ops (0/10 transitions)
    - `courier_dispatch_batches`: 0/2 transitions impl (service: NONE) — MISSING ['archived', 'ready_for_dispatch']
    - `courier_shipments`: 0/2 transitions impl (service: NONE) — MISSING ['archived', 'ready']
    - `courier_receipts`: 0/2 transitions impl (service: NONE) — MISSING ['archived', 'submitted']
    - `courier_exceptions`: 0/2 transitions impl (service: NONE) — MISSING ['archived', 'under_review']
    - `courier_shipments`: 0/2 transitions impl (service: NONE) — MISSING ['blocked_by_mismatch', 'handoff_ready']
### evaluation_ops (1/23 transitions)
    - `evaluation_answer_keys`: 1/4 transitions impl (service: staff) — MISSING ['final', 'superseded', 'under_review']
    - `evaluation_import_batches`: 0/7 transitions impl (service: NONE) — MISSING ['approved_for_results', 'scored', 'scoring', 'under_review', 'validated', 'validating', 'validation_failed']
    - `evaluation_score_batches`: 0/5 transitions impl (service: NONE) — MISSING ['approved_for_results', 'rejected', 'scored', 'scoring', 'under_review']
    - `evaluation_exceptions`: 0/5 transitions impl (service: NONE) — MISSING ['accepted_with_risk', 'closed', 'open', 'resolved', 'under_review']
    - `evaluation_score_batches`: 0/2 transitions impl (service: NONE) — MISSING ['handoff_blocked', 'handoff_to_results']
### exam_material_ops (1/19 transitions)
    - `exam_material_templates`: 1/4 transitions impl (service: staff) — MISSING ['active', 'retired', 'under_review']
    - `exam_material_packages`: 0/9 transitions impl (service: school) — MISSING ['approved', 'downloaded', 'failed', 'generated', 'released', 'replaced', 'revoked', 'scheduled', 'under_review']
    - `exam_material_approvals`: 0/2 transitions impl (service: NONE) — MISSING ['approved', 'rejected']
    - `exam_material_download_events`: 0/4 transitions impl (service: NONE) — MISSING ['download_completed', 'download_denied', 'download_granted', 'download_requested']
### exam_materials (4/7 transitions)
    - `exam_materials`: 4/7 transitions impl (service: staff) — MISSING ['downloaded', 'expired', 'scheduled_for_release']
### exam_slot_ops (4/21 transitions)
    - `exam_cycles`: 3/4 transitions impl (service: staff) — MISSING ['under_review']
    - `exam_slots`: 1/7 transitions impl (service: staff) — MISSING ['approved', 'assignment_closed', 'assignment_open', 'locked', 'published', 'under_review']
    - `school_exam_slot_assignments`: 0/6 transitions impl (service: school) — MISSING ['cancelled', 'confirmed', 'locked', 'pending_confirmation', 'reschedule_requested', 'rescheduled']
    - `exam_slot_reschedule_requests`: 0/4 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'submitted', 'under_review']
### exam_slots (2/8 transitions)
    - `exam_slots`: 2/4 transitions impl (service: staff) — MISSING ['full', 'open']
    - `exam_slot_bookings`: 0/4 transitions impl (service: NONE) — MISSING ['cancelled', 'confirmed', 'locked', 'rescheduled']
### finance_ops (1/17 transitions)
    - `finance_invoices`: 1/5 transitions impl (service: staff) — MISSING ['issued', 'partially_paid', 'superseded', 'voided']
    - `finance_payments`: 0/4 transitions impl (service: NONE) — MISSING ['confirmed', 'failed', 'refunded_or_partially_refunded', 'reversed']
    - `finance_adjustments`: 0/5 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'rejected', 'submitted', 'under_review']
    - `finance_reconciliation_batches`: 0/3 transitions impl (service: NONE) — MISSING ['closed', 'exception', 'matched_or_partially_matched_or_mismatch']
### notification_ops (1/22 transitions)
    - `notification_templates`: 1/4 transitions impl (service: staff) — MISSING ['active', 'retired', 'under_review']
    - `notification_batches`: 0/9 transitions impl (service: NONE) — MISSING ['approved', 'cancelled', 'dry_run', 'failed', 'partially_failed', 'queued', 'sending', 'sent', 'under_review']
    - `notification_messages`: 0/5 transitions impl (service: NONE) — MISSING ['expired', 'failed', 'queued', 'sending', 'sent']
    - `notification_delivery_attempts`: 0/4 transitions impl (service: NONE) — MISSING ['failed_permanent', 'failed_temporary', 'rate_limited', 'sent']
### notifications (1/12 transitions)
    - `notification_templates`: 1/3 transitions impl (service: staff) — MISSING ['active', 'superseded']
    - `notification_events`: 0/4 transitions impl (service: NONE) — MISSING ['created', 'failed', 'queued_or_partially_queued', 'suppressed']
    - `notification_deliveries`: 0/5 transitions impl (service: NONE) — MISSING ['delivered', 'failed_or_retry_scheduled', 'rendered', 'sent', 'suppressed']
### omr_imports (1/8 transitions)
    - `answer_keys`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'approved', 'superseded']
    - `omr_imports`: 1/5 transitions impl (service: staff) — MISSING ['parsed', 'scored', 'superseded', 'validation_passed_or_validation_failed']
### payments (0/8 transitions)
    - `payments`: 0/8 transitions impl (service: school+staff) — MISSING ['payment_draft', 'payment_failed', 'payment_link_created', 'payment_manually_confirmed', 'payment_paid', 'payment_pending', 'payment_reversed', 'reconciled']
### reports_exports (0/20 transitions)
    - `report_definitions`: 0/3 transitions impl (service: staff) — MISSING ['active', 'retired', 'under_review']
    - `export_requests`: 0/9 transitions impl (service: NONE) — MISSING ['approved', 'expired', 'failed', 'generated', 'generating', 'queued', 'rejected', 'submitted', 'under_review']
    - `report_snapshots`: 0/4 transitions impl (service: NONE) — MISSING ['active', 'created', 'expired', 'superseded']
    - `export_download_events`: 0/4 transitions impl (service: NONE) — MISSING ['completed', 'denied', 'expired', 'granted']
### results (4/13 transitions)
    - `results`: 4/8 transitions impl (service: staff) — MISSING ['corrected', 'ranked', 'superseded', 'under_review']
    - `result_publications`: 0/5 transitions impl (service: NONE) — MISSING ['approved', 'published', 'ready_for_review', 'revoked', 'scheduled']
### results_ops (4/24 transitions)
    - `result_batches`: 4/9 transitions impl (service: staff) — MISSING ['corrected', 'correction_pending', 'ranked', 'ranking', 'under_review']
    - `candidate_results`: 0/6 transitions impl (service: school) — MISSING ['approved', 'corrected', 'generated', 'published', 'ranked', 'withheld']
    - `result_corrections`: 0/5 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'rejected', 'submitted', 'under_review']
    - `result_publication_windows`: 0/4 transitions impl (service: NONE) — MISSING ['cancelled', 'paused', 'published', 'scheduled']
### roles_permissions (1/15 transitions)
    - `portal_roles`: 1/4 transitions impl (service: staff) — MISSING ['active', 'deprecated', 'disabled']
    - `portal_permission_rules`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'disabled', 'under_review']
    - `role_change_requests`: 0/5 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'rejected', 'submitted', 'under_review']
    - `approval_policies`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'deprecated', 'disabled']
### school_crm (0/17 transitions)
    - `school_leads`: 0/10 transitions impl (service: school) — MISSING ['brochure_sent', 'contacted', 'converted', 'demo_completed', 'demo_scheduled', 'follow_up', 'lost', 'new_lead', 'payment_pending', 'proposal_sent']
    - `school_lead_import_batches`: 0/3 transitions impl (service: NONE) — MISSING ['cancelled', 'imported_or_partially_imported', 'validated_or_validation_failed']
    - `school_leads`: 0/4 transitions impl (service: school) — MISSING ['confirmed_duplicate', 'merged', 'not_duplicate', 'possible_duplicate']
### school_onboarding_ops (6/10 transitions)
    - `school_onboarding_documents`: 0/2 transitions impl (service: NONE) — MISSING ['accepted', 'rejected']
    - `school_status_controls`: 0/2 transitions impl (service: NONE) — MISSING ['active', 'released']
### schools (2/8 transitions)
    - `schools`: 2/5 transitions impl (service: staff) — MISSING ['inactive', 'registered', 'under_review']
    - `school_users`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'disabled', 'invited']
### security_audit_console (0/28 transitions)
    - `security_incidents`: 0/7 transitions impl (service: NONE) — MISSING ['closed', 'contained', 'false_positive', 'investigating', 'open', 'resolved', 'triaged']
    - `security_alerts`: 0/6 transitions impl (service: NONE) — MISSING ['acknowledged', 'converted_to_incident', 'dismissed', 'escalated', 'new', 'resolved']
    - `access_reviews`: 0/5 transitions impl (service: NONE) — MISSING ['attested', 'closed', 'findings_open', 'in_progress', 'remediation']
    - `permission_drift_findings`: 0/5 transitions impl (service: NONE) — MISSING ['accepted', 'false_positive', 'open', 'remediation_task_created', 'resolved']
    - `forensics_cases`: 0/5 transitions impl (service: NONE) — MISSING ['analysis', 'closed', 'collecting_evidence', 'findings_ready', 'open']
### staff_users (2/13 transitions)
    - `staff_invitations`: 0/4 transitions impl (service: NONE) — MISSING ['accepted', 'cancelled', 'expired', 'resent']
    - `staff_profiles`: 2/5 transitions impl (service: staff) — MISSING ['active', 'disabled', 'exited']
    - `staff_assignment_scopes`: 0/4 transitions impl (service: NONE) — MISSING ['active', 'expired', 'paused', 'revoked']
### student_roster_ops (3/15 transitions)
    - `student_roster_batches`: 3/8 transitions impl (service: staff) — MISSING ['correction_pending', 'superseded', 'unlock_requested', 'validating', 'validation_failed']
    - `candidate_id_events`: 0/3 transitions impl (service: NONE) — MISSING ['generated', 'regenerated', 'voided']
    - `student_roster_corrections`: 0/4 transitions impl (service: NONE) — MISSING ['applied', 'approved', 'submitted', 'under_review']
### students (0/5 transitions)
    - `participations + students`: 0/5 transitions impl (service: NONE) — MISSING ['count_finalised', 'locked', 'students_open', 'upload_received', 'validation_passed_or_validation_failed']
### support_tickets (0/21 transitions)
    - `support_tickets`: 0/9 transitions impl (service: NONE) — MISSING ['assigned', 'closed', 'escalated', 'new', 'open', 'reopened', 'resolved', 'waiting_on_school', 'waiting_on_staff']
    - `support_ticket_messages`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'archived', 'redacted']
    - `support_ticket_escalations`: 0/5 transitions impl (service: NONE) — MISSING ['closed', 'open', 'rejected', 'resolved', 'under_review']
    - `support_tickets`: 0/4 transitions impl (service: NONE) — MISSING ['breached', 'met', 'paused', 'running']
### task_work_queue (0/21 transitions)
    - `work_tasks`: 0/10 transitions impl (service: NONE) — MISSING ['assigned', 'blocked', 'cancelled', 'completed', 'escalated', 'in_progress', 'new', 'queued', 'reopened', 'waiting']
    - `task_assignments`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'cancelled', 'superseded']
    - `task_sla_events`: 0/5 transitions impl (service: NONE) — MISSING ['breached', 'met', 'paused', 'running', 'waived']
    - `task_dependencies`: 0/3 transitions impl (service: NONE) — MISSING ['active', 'cancelled', 'resolved']