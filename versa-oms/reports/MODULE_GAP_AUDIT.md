# Module Gap Audit (mechanical, spec-grounded, both portals)

Supersedes the heuristic source_of_truth_audit. Counts only ACTIONABLE transition
targets (those that should become an action); intermediate states are excluded.

**Actionable transitions implemented: 127/145 (88%)**.
Intermediate (intentionally not actions, informational): 296.
**Entities with actionable transitions but NO service (unbuilt): 6.**
**School portal action routes present:** YES  ·  **Staff:** YES
**School-facing entities with any implemented action:** 10/18

## Per module (worst first)

| Module | actions impl/declared | % | features |
|---|--:|--:|--:|
| school_crm | 0/1 | 0% | 7 |
| students | 0/1 | 0% | 6 |
| exam_material_ops | 3/8 | 38% | 8 |
| notifications | 1/2 | 50% | 6 |
| omr_imports | 1/2 | 50% | 5 |
| exam_slot_ops | 7/12 | 58% | 7 |
| support_tickets | 3/4 | 75% | 7 |
| exam_slots | 4/5 | 80% | 4 |
| student_roster_ops | 5/6 | 83% | 6 |
| certificate_ops | 8/9 | 89% | 7 |
| results_ops | 14/14 | 100% | 6 |
| results | 8/8 | 100% | 6 |
| school_onboarding_ops | 8/8 | 100% | 7 |
| finance_ops | 7/7 | 100% | 6 |
| evaluation_ops | 6/6 | 100% | 6 |
| admin_settings | 5/5 | 100% | 6 |
| certificates | 5/5 | 100% | 6 |
| courier_ops | 5/5 | 100% | 8 |
| audit | 4/4 | 100% | 7 |
| courier | 4/4 | 100% | 5 |
| exam_materials | 4/4 | 100% | 5 |
| reports_exports | 4/4 | 100% | 7 |
| roles_permissions | 4/4 | 100% | 6 |
| staff_users | 4/4 | 100% | 6 |
| task_work_queue | 4/4 | 100% | 7 |
| notification_ops | 3/3 | 100% | 7 |
| security_audit_console | 3/3 | 100% | 7 |
| schools | 2/2 | 100% | 4 |
| company_dashboard | 1/1 | 100% | 5 |
| payments | 0/0 | 100% | 6 |

## Gap detail (entities with missing transitions or no service)

### certificate_ops (8/9 actions)
    - `certificates`: 4/5 actions impl (service: school+staff) — MISSING ['reissued']
### exam_material_ops (3/8 actions)
    - `exam_material_packages`: 0/5 actions impl (service: school) — MISSING ['approved', 'generated', 'released', 'revoked', 'scheduled']
### exam_slot_ops (7/12 actions)
    - `exam_slots`: 1/4 actions impl (service: staff) — MISSING ['approved', 'locked', 'published']
    - `school_exam_slot_assignments`: 1/3 actions impl (service: school) — MISSING ['cancelled', 'locked']
### exam_slots (4/5 actions)
    - `exam_slot_bookings`: 2/3 actions impl (service: school+staff) — MISSING ['confirmed']
### notifications (1/2 actions)
    - `notification_deliveries`: 0/1 actions impl (service: NONE) — MISSING ['delivered']
### omr_imports (1/2 actions)
    - `answer_keys`: 0/1 actions impl (service: NONE) — MISSING ['approved']
### school_crm (0/1 actions)
    - `school_lead_import_batches`: 0/1 actions impl (service: NONE) — MISSING ['cancelled']
### student_roster_ops (5/6 actions)
    - `candidate_id_events`: 0/1 actions impl (service: NONE) — MISSING ['generated']
### students (0/1 actions)
    - `participations + students`: 0/1 actions impl (service: NONE) — MISSING ['locked']
### support_tickets (3/4 actions)
    - `support_ticket_messages`: 0/1 actions impl (service: NONE) — MISSING ['archived']