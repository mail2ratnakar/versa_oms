# Module Gap Audit (mechanical, spec-grounded, both portals)

Supersedes the heuristic source_of_truth_audit. Counts only ACTIONABLE transition
targets (those that should become an action); intermediate states are excluded.

**Actionable transitions implemented: 54/145 (37%)**.
Intermediate (intentionally not actions, informational): 296.
**Entities with actionable transitions but NO service (unbuilt): 45.**
**School portal action routes present:** YES  ·  **Staff:** YES
**School-facing entities with any implemented action:** 5/15

## Per module (worst first)

| Module | actions impl/declared | % | features |
|---|--:|--:|--:|
| admin_settings | 0/5 | 0% | 6 |
| courier_ops | 0/5 | 0% | 8 |
| audit | 0/4 | 0% | 7 |
| reports_exports | 0/4 | 0% | 7 |
| support_tickets | 0/4 | 0% | 7 |
| task_work_queue | 0/4 | 0% | 7 |
| security_audit_console | 0/3 | 0% | 7 |
| school_crm | 0/1 | 0% | 7 |
| students | 0/1 | 0% | 6 |
| exam_material_ops | 1/8 | 12% | 8 |
| finance_ops | 1/7 | 14% | 6 |
| evaluation_ops | 1/6 | 17% | 6 |
| roles_permissions | 1/4 | 25% | 6 |
| results_ops | 4/14 | 29% | 6 |
| notification_ops | 1/3 | 33% | 7 |
| exam_slots | 2/5 | 40% | 4 |
| exam_slot_ops | 5/12 | 42% | 7 |
| results | 4/8 | 50% | 6 |
| student_roster_ops | 3/6 | 50% | 6 |
| staff_users | 2/4 | 50% | 6 |
| notifications | 1/2 | 50% | 6 |
| omr_imports | 1/2 | 50% | 5 |
| certificate_ops | 5/9 | 56% | 7 |
| school_onboarding_ops | 6/8 | 75% | 7 |
| certificates | 5/5 | 100% | 6 |
| courier | 4/4 | 100% | 5 |
| exam_materials | 4/4 | 100% | 5 |
| schools | 2/2 | 100% | 4 |
| company_dashboard | 1/1 | 100% | 5 |
| payments | 0/0 | 100% | 6 |

## Gap detail (entities with missing transitions or no service)

### admin_settings (0/5 actions)
    - `setting_versions`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'scheduled']
    - `setting_change_requests`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
### audit (0/4 actions)
    - `audit_events`: 0/1 actions impl (service: NONE) — MISSING ['archived']
    - `audit_cases`: 0/1 actions impl (service: NONE) — MISSING ['closed']
    - `security_incidents`: 0/1 actions impl (service: NONE) — MISSING ['closed']
    - `reconciliation_runs`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### certificate_ops (5/9 actions)
    - `certificates`: 4/5 actions impl (service: school+staff) — MISSING ['reissued']
    - `certificate_requests`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
### courier_ops (0/5 actions)
    - `courier_dispatch_batches`: 0/1 actions impl (service: NONE) — MISSING ['archived']
    - `courier_shipments`: 0/1 actions impl (service: NONE) — MISSING ['archived']
    - `courier_receipts`: 0/2 actions impl (service: NONE) — MISSING ['archived', 'submitted']
    - `courier_exceptions`: 0/1 actions impl (service: NONE) — MISSING ['archived']
### evaluation_ops (1/6 actions)
    - `evaluation_import_batches`: 0/2 actions impl (service: NONE) — MISSING ['approved_for_results', 'validated']
    - `evaluation_score_batches`: 0/2 actions impl (service: NONE) — MISSING ['approved_for_results', 'rejected']
    - `evaluation_exceptions`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### exam_material_ops (1/8 actions)
    - `exam_material_packages`: 0/5 actions impl (service: school) — MISSING ['approved', 'generated', 'released', 'revoked', 'scheduled']
    - `exam_material_approvals`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'rejected']
### exam_slot_ops (5/12 actions)
    - `exam_slots`: 1/4 actions impl (service: staff) — MISSING ['approved', 'locked', 'published']
    - `school_exam_slot_assignments`: 1/3 actions impl (service: school) — MISSING ['cancelled', 'locked']
    - `exam_slot_reschedule_requests`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'submitted']
### exam_slots (2/5 actions)
    - `exam_slot_bookings`: 0/3 actions impl (service: NONE) — MISSING ['cancelled', 'confirmed', 'locked']
### finance_ops (1/7 actions)
    - `finance_payments`: 0/2 actions impl (service: NONE) — MISSING ['confirmed', 'reversed']
    - `finance_adjustments`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
    - `finance_reconciliation_batches`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### notification_ops (1/3 actions)
    - `notification_batches`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'cancelled']
### notifications (1/2 actions)
    - `notification_deliveries`: 0/1 actions impl (service: NONE) — MISSING ['delivered']
### omr_imports (1/2 actions)
    - `answer_keys`: 0/1 actions impl (service: NONE) — MISSING ['approved']
### reports_exports (0/4 actions)
    - `export_requests`: 0/4 actions impl (service: NONE) — MISSING ['approved', 'generated', 'rejected', 'submitted']
### results (4/8 actions)
    - `result_publications`: 0/4 actions impl (service: NONE) — MISSING ['approved', 'published', 'revoked', 'scheduled']
### results_ops (4/14 actions)
    - `candidate_results`: 0/4 actions impl (service: school) — MISSING ['approved', 'generated', 'published', 'withheld']
    - `result_corrections`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
    - `result_publication_windows`: 0/3 actions impl (service: NONE) — MISSING ['cancelled', 'published', 'scheduled']
### roles_permissions (1/4 actions)
    - `role_change_requests`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
### school_crm (0/1 actions)
    - `school_lead_import_batches`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']
### school_onboarding_ops (6/8 actions)
    - `school_onboarding_documents`: 0/1 actions impl (service: NONE) — MISSING ['rejected']
    - `school_status_controls`: 0/1 actions impl (service: NONE) — MISSING ['released']
### security_audit_console (0/3 actions)
    - `security_incidents`: 0/1 actions impl (service: NONE) — MISSING ['closed']
    - `access_reviews`: 0/1 actions impl (service: NONE) — MISSING ['closed']
    - `forensics_cases`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### staff_users (2/4 actions)
    - `staff_invitations`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']
    - `staff_assignment_scopes`: 0/1 actions impl (service: NONE) — MISSING ['revoked']
### student_roster_ops (3/6 actions)
    - `candidate_id_events`: 0/1 actions impl (service: NONE) — MISSING ['generated']
    - `student_roster_corrections`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'submitted']
### students (0/1 actions)
    - `participations + students`: 0/1 actions impl (service: NONE) — MISSING ['locked']
### support_tickets (0/4 actions)
    - `support_tickets`: 0/1 actions impl (service: NONE) — MISSING ['closed']
    - `support_ticket_messages`: 0/1 actions impl (service: NONE) — MISSING ['archived']
    - `support_ticket_escalations`: 0/2 actions impl (service: NONE) — MISSING ['closed', 'rejected']
### task_work_queue (0/4 actions)
    - `work_tasks`: 0/2 actions impl (service: NONE) — MISSING ['blocked', 'cancelled']
    - `task_assignments`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']
    - `task_dependencies`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']