# Module Gap Audit (mechanical, spec-grounded, both portals)

Supersedes the heuristic source_of_truth_audit. Counts only ACTIONABLE transition
targets (those that should become an action); intermediate states are excluded.

**Actionable transitions implemented: 99/145 (68%)**.
Intermediate (intentionally not actions, informational): 296.
**Entities with actionable transitions but NO service (unbuilt): 23.**
**School portal action routes present:** YES  ·  **Staff:** YES
**School-facing entities with any implemented action:** 6/16

## Per module (worst first)

| Module | actions impl/declared | % | features |
|---|--:|--:|--:|
| school_crm | 0/1 | 0% | 7 |
| students | 0/1 | 0% | 6 |
| roles_permissions | 1/4 | 25% | 6 |
| notification_ops | 1/3 | 33% | 7 |
| exam_material_ops | 3/8 | 38% | 8 |
| exam_slots | 2/5 | 40% | 4 |
| exam_slot_ops | 5/12 | 42% | 7 |
| results | 4/8 | 50% | 6 |
| student_roster_ops | 3/6 | 50% | 6 |
| staff_users | 2/4 | 50% | 6 |
| support_tickets | 2/4 | 50% | 7 |
| notifications | 1/2 | 50% | 6 |
| omr_imports | 1/2 | 50% | 5 |
| certificate_ops | 5/9 | 56% | 7 |
| security_audit_console | 2/3 | 67% | 7 |
| school_onboarding_ops | 6/8 | 75% | 7 |
| audit | 3/4 | 75% | 7 |
| task_work_queue | 3/4 | 75% | 7 |
| evaluation_ops | 5/6 | 83% | 6 |
| finance_ops | 6/7 | 86% | 6 |
| results_ops | 14/14 | 100% | 6 |
| admin_settings | 5/5 | 100% | 6 |
| certificates | 5/5 | 100% | 6 |
| courier_ops | 5/5 | 100% | 8 |
| courier | 4/4 | 100% | 5 |
| exam_materials | 4/4 | 100% | 5 |
| reports_exports | 4/4 | 100% | 7 |
| schools | 2/2 | 100% | 4 |
| company_dashboard | 1/1 | 100% | 5 |
| payments | 0/0 | 100% | 6 |

## Gap detail (entities with missing transitions or no service)

### audit (3/4 actions)
    - `audit_events`: 0/1 actions impl (service: NONE) — MISSING ['archived']
### certificate_ops (5/9 actions)
    - `certificates`: 4/5 actions impl (service: school+staff) — MISSING ['reissued']
    - `certificate_requests`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
### evaluation_ops (5/6 actions)
    - `evaluation_exceptions`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### exam_material_ops (3/8 actions)
    - `exam_material_packages`: 0/5 actions impl (service: school) — MISSING ['approved', 'generated', 'released', 'revoked', 'scheduled']
### exam_slot_ops (5/12 actions)
    - `exam_slots`: 1/4 actions impl (service: staff) — MISSING ['approved', 'locked', 'published']
    - `school_exam_slot_assignments`: 1/3 actions impl (service: school) — MISSING ['cancelled', 'locked']
    - `exam_slot_reschedule_requests`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'submitted']
### exam_slots (2/5 actions)
    - `exam_slot_bookings`: 0/3 actions impl (service: NONE) — MISSING ['cancelled', 'confirmed', 'locked']
### finance_ops (6/7 actions)
    - `finance_reconciliation_batches`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### notification_ops (1/3 actions)
    - `notification_batches`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'cancelled']
### notifications (1/2 actions)
    - `notification_deliveries`: 0/1 actions impl (service: NONE) — MISSING ['delivered']
### omr_imports (1/2 actions)
    - `answer_keys`: 0/1 actions impl (service: NONE) — MISSING ['approved']
### results (4/8 actions)
    - `result_publications`: 0/4 actions impl (service: NONE) — MISSING ['approved', 'published', 'revoked', 'scheduled']
### roles_permissions (1/4 actions)
    - `role_change_requests`: 0/3 actions impl (service: NONE) — MISSING ['approved', 'rejected', 'submitted']
### school_crm (0/1 actions)
    - `school_lead_import_batches`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']
### school_onboarding_ops (6/8 actions)
    - `school_onboarding_documents`: 0/1 actions impl (service: NONE) — MISSING ['rejected']
    - `school_status_controls`: 0/1 actions impl (service: NONE) — MISSING ['released']
### security_audit_console (2/3 actions)
    - `forensics_cases`: 0/1 actions impl (service: NONE) — MISSING ['closed']
### staff_users (2/4 actions)
    - `staff_invitations`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']
    - `staff_assignment_scopes`: 0/1 actions impl (service: NONE) — MISSING ['revoked']
### student_roster_ops (3/6 actions)
    - `candidate_id_events`: 0/1 actions impl (service: NONE) — MISSING ['generated']
    - `student_roster_corrections`: 0/2 actions impl (service: NONE) — MISSING ['approved', 'submitted']
### students (0/1 actions)
    - `participations + students`: 0/1 actions impl (service: NONE) — MISSING ['locked']
### support_tickets (2/4 actions)
    - `support_tickets`: 0/1 actions impl (service: NONE) — MISSING ['closed']
    - `support_ticket_messages`: 0/1 actions impl (service: NONE) — MISSING ['archived']
### task_work_queue (3/4 actions)
    - `task_dependencies`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']