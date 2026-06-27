# STAFF PORTAL — the OJ series (FROZEN from the BRD)

The **operations team's** journeys. Frozen 2026-06-27 from BRD §06 (features) · §11 (staff screens) · §03 (staff
roles). Scope: **all schools** (staff are NOT school-scoped) — but role-gated at the AUTH phase (each OJ maps to
a staff role; deny-by-default). The OJ screens are the staff side of the same entity lifecycles the school
portal (SJ) feeds; they reuse the generated services/routes.

| OJ | Journey | BRD screen (§11) | BRD feature (§06) | Entity · staff actions | Role (gated at auth) |
|----|---------|------------------|-------------------|------------------------|----------------------|
| **OJ1** | Operations dashboard | `staff_dashboard` | — | participations (read, all) | operations_head / executive |
| **OJ2** | Schools (acquire → onboard) | `staff_schools` | school_registration + school_approval | schools: **OJ2.1** create lead @ lead · **OJ2.2** submit_registration (lead→registered, **creates a participation**) · **OJ2.3** approve_school / block_school · **OJ2.4** open_student_upload | sales_executive (lead), school_onboarding_executive, operations_head |
| **OJ3** | Reconcile payments | `staff_payments` | manual_payment_confirmation + payment reconcile | payments: manual_confirm / reconcile / reverse | finance_admin / finance_executive |
| **OJ4** | Exam slots | `staff_exam_slots` | exam_slot publish/manage | exam_slots: capacity_full / change_slot (+ create open slots) | exam_operations_manager |
| **OJ5** | Release materials | `staff_materials` | exam_material_release | exam_materials: approve_material / schedule_release / release_when_due / revoke | content_manager, material_release_manager |
| **OJ6** | Receive couriers | `staff_courier` | answer_sheet_receipt | courier_batches: confirm_receipt / close_batch | courier_manager |
| **OJ7** | OMR import & match | `staff_omr_import` | omr_result_import | omr_imports: upload_omr / validate_import / approve_import / reject_import (+ matchOmrCandidates) | omr_import_operator, evaluation_manager |
| **OJ8** | Approve & publish results | `staff_results` | result_approval + result_publication | results: review_results / approve / publish / withhold / correct | results_approver |
| **OJ9** | Generate certificates | `staff_certificates` | certificate_generation | certificates: issue / revoke (generate triggered by results_published) | certificate_manager |

**Frozen build order:** OJ1 → OJ2 → OJ3 → OJ4 → OJ5 → OJ6 → OJ7 → OJ8 → OJ9. Built **unscoped + open now**;
**role-gating + login wire at auth-last** (each OJ → its staff role, deny-by-default, per §03/§15). The school
portal (SJ) and staff portal (OJ) are the two BRD portals; together they cover the full pipeline from both sides.
