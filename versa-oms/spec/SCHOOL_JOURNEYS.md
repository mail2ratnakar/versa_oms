# SCHOOL PORTAL — the SJ series (FROZEN from the BRD)

The **school coordinator's** journeys through the olympiad. Frozen 2026-06-27 from BRD §06 (features) ·
§11 (screens) · §03 (school_coordinator scope) · §09 (status) · §13 (files). Scope rule (BRD §03/§15):
**`own_school_only`** — every query filtered by the coordinator's `school_id`; hide internal notes,
evaluation fields, finance internals, other schools. Scoping/login wire at the AUTH phase (auth-last); the
journey screens + flows build now (open + browsable, school context assumed).

These are the SCHOOL FRONT-END journeys. The J1–J10 work already proved the back-end pipeline + lifecycles;
SJ reuses those same generated services/routes, presented as scoped, journey-shaped school screens.

| SJ | Journey | BRD screen (§11) | BRD feature (§06) | Entity · workflow effect | School does | Notes / guards |
|----|---------|------------------|-------------------|--------------------------|-------------|----------------|
| **SJ1** | Register school | `school_registration` | school_registration | `schools`: lead → registered | submits school + coordinator details | PUBLIC (pre-login); school_required_fields, coordinator_email_valid, duplicate_check |
| **SJ2** | Coordinator login | `login` | coordinator_login | `users`/`school_users` | logs in → scoped to own school | **AUTH-LAST**; deny-by-default, session, MFA for admins only |
| **SJ3** | Dashboard | `school_dashboard` | school_dashboard | `participations` (read) | sees own participations + pipeline status | own_school_only; the participation spine is the status shown |
| **SJ4** | Upload students | `student_upload` | student_template_download + student_upload | `students` + `participations`: students_open → upload_received | downloads CSV template, uploads roster | candidate_id AUTO-GEN; file_type/size, required_columns, consent, duplicate rules |
| **SJ5** | Validate & finalise | `student_validation_review` | student_validation + finalise_student_count | `participations`: upload_received → validation_passed → count_finalised | reviews errors, fixes, finalises (locks count) | consent_required_for_finalisation; locked_participation_edit |
| **SJ6** | Payment | `payment_page` | fee_commission_calculation + payment_link_creation + payment | `payments` + `participations`: payment_pending → paid | sees invoice (fee × count), pays via Razorpay link | net_amount_non_negative; finance internals hidden; webhook confirms |
| **SJ7** | Select exam slot | `exam_slot_page` | exam_slot_selection | `exam_slots` + `participations` → slot_confirmed | picks a staff-predefined slot OR proposes own cycle/date/time | **max flexibility** (predefined + own); payment_before_slot, slot_capacity_check |
| **SJ8** | Download materials | `exam_materials_page` | exam_material_release + material_download | `exam_materials`: released | time-gated download: question papers (4 randomised sets) + named answer sheets | signed_downloads, file_download_audit, release window, payment_before_material |
| **SJ9** | Submit courier | `courier_page` | courier_submission | `courier_batches` → dispatched | after exam, submits courier details (company, AWB, counts) to return sheets | courier_required_fields; received_count_reconciliation |
| **SJ10** | View results | `results_page` | result_publication (view) | `results`: published (read) | views own published results | own_school_only; evaluation notes hidden; only after publish |
| **SJ11** | Download certificates | `certificates_page` | certificate_generation (view) + certificate_download | `certificates`: issued | downloads own issued certificate PDFs | certificate_private_pdf, signed downloads |
| **SJ12** | Verify certificate (PUBLIC) | `certificate_verify_public` | certificate_verification | `certificates` (stateless lookup) | anyone enters verification_code → valid/invalid/revoked | public_certificate_fields only; rate_limited; the stateless action already modeled |

**Frozen build order:** SJ1 → SJ3 → SJ4 → SJ5 → SJ6 → SJ7 → SJ8 → SJ9 → SJ10 → SJ11 → SJ12. **SJ2 (login)
wires last** with the auth phase, which also turns on `own_school_only` scoping + field-level restrictions
across ALL the above. A parallel **staff portal (OJ series)** covers the staff-side screens (approve, reconcile,
omr import, approve/publish results, generate certs) — define separately.
