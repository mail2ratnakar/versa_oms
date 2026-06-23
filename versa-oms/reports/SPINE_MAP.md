# Versa OMS — End-to-End Spine (Claude's understanding, for confirmation)

Built from the answered questionnaire + each module's `lifecycle_states.json` and gate policy
files. States below are the ACTUAL spec states. School portal ships in parallel, so both
school-side and staff-side touchpoints are shown. **This is for the user to correct before any build.**

Legend: `▸ staff` = Company Portal action · `▸ school` = School Portal action · **GATE** = hard precondition.

---

## Stage 0 — Identity & access (foundation, both portals)
- ▸ staff: invite-only, admin-created accounts; role + department + assignment-scope (schools/regions/olympiads/queues) controls visibility. Auditor read-only; Security reviewer controlled actions.
- ▸ school: coordinator account (email-verified) for the school's own portal.
- Rules everywhere: maker≠checker, dual-approval on high-risk, no hard delete, audit+reason, field masking by role.

## Stage 1 — School acquisition · `school_crm`
- ▸ staff: `school_lead`: New Lead → Contacted → Brochure Sent → Demo → Proposal → Follow-up → Payment Pending → **Converted** / Lost (lost reason mandatory). Dedupe by name+city/email/phone. Convert → creates/links a `school` record (keeps `converted_school_id`).

## Stage 2 — School onboarding · `school_onboarding_ops`
- ▸ staff: `school_onboarding_case` → verify identity/board/contacts/duplicate → Operations Head/Company Admin **approve**. `school_status_controls`: active / blocked / suspended (downstream impact). Post-approval edits need reason+audit.
- ▸ school: completes profile / coordinator verification.

## Stage 3 — Student roster · `student_roster_ops`
- ▸ school (or ▸ staff on-behalf, `source=staff_uploaded`): upload → `student_roster_batch`: uploaded → validating → validated → submitted_for_lock → **locked**.
- On lock → `candidate_id_event` (append-only) auto-generates candidate IDs. Post-lock fixes = `student_roster_correction` (approval + impact check).
- **GATE OUT:** roster `locked` + candidate IDs are required before exam materials can be generated.

## Stage 4 — Payment · `finance_ops`
- ▸ staff (Finance): `finance_invoice` draft → issued → paid; `finance_payment_link` created → sent → opened → paid; `finance_payment` pending → **confirmed**. Manual confirm needs proof; dual-approval for above-threshold/manual/mismatch. Refund/reversal = workflow.
- ▸ school: pays via link.
- **GATE OUT:** finance status ∈ {paid, approved_credit, approved_waiver} required for final slot confirmation; **rechecked before slot lock**; a reversal invalidates readiness.

## Stage 5 — Exam slots · `exam_slot_ops`
- ▸ staff: `exam_cycle` draft → approved → published; `exam_slot` draft → published → assignment_open → **locked**; `school_exam_slot_assignment` draft → pending_confirmation → **confirmed** → locked. Capacity conflicts block (override = approval). Reschedule = reason + material-impact check.
- **GATES IN:** payment-gate (paid) **and** roster-gate (locked). **GATE OUT:** slot `locked` before material generation.

## Stage 6 — Exam materials · `exam_material_ops`
- ▸ staff: `exam_material_package` draft → generation_requested → generated → under_review → **approved** → scheduled → **released** → downloaded. Dual-approval for question-paper release; timed release + manual override; revoke = reason; replace = version + reason + audit. Ops see download audit, not necessarily file contents.
- ▸ school: downloads released materials (audited per school).
- **GATES IN:** slot locked + roster locked + payment ok.

## Stage 7 — Courier OUT · `courier_ops`
- ▸ staff: `courier_dispatch_batch` draft → ready_for_dispatch → dispatched → in_transit → delivered; `courier_shipment` per school with AWB (manual entry in MVP). School receives physical papers.

## Stage 8 — Exam day (physical) → Courier BACK · `courier_ops`
- Exam is sat on paper. Answer sheets couriered back. `courier_shipment` (return) → received; `courier_receipt` submitted → **confirmed** (count check). Mismatch / lost / damaged → exception + (manager approval beyond tolerance) + possible incident.
- ▸ school: may submit return AWB.
- **GATE OUT:** receipt/count reconciled before OMR import proceeds.

## Stage 9 — OMR & evaluation · `evaluation_ops`
- ▸ staff: `evaluation_answer_key` draft → under_review → **approved** → final (dual-approval); `evaluation_import_batch` uploaded → validating → validated → scoring → scored → under_review → **approved_for_results** (maker≠checker; OMR operator can't approve own import). Exceptions resolved on candidate-ID-only view. No direct score edits.
- **GATE OUT:** `approved_for_results` required to generate results.

## Stage 10 — Results · `results_ops`
- ▸ staff: `result_batch` draft → generated → ranking → ranked → under_review → **approved** → scheduled → **published** (dual-approval to publish). Withhold individuals (reason). Ranking dims: national/state/school/grade/subject. Post-publish correction → triggers certificate impact.
- ▸ school: sees published results (school-visible in MVP; public lookup later).
- **GATES:** IN = OMR approved_for_results · OUT = `published` required for certificates.

## Stage 11 — Certificates · `certificate_ops`
- ▸ staff: `certificate_eligibility_snapshot` eligible/not_eligible/withheld; `certificate` draft → generation_requested → generated → approved → **published** → downloaded. Auto-generate eligible after results publish. Revoke/reissue = approval + supersede.
- ▸ school: downloads (parent/student later). ▸ public `/verify`: QR/code → only whitelisted minimal fields; revoked shows invalid.

---

## Always-on rails (cross-cutting, every stage)
- `notification_ops` — email + in-app on each event; retries + dead-letter; bulk needs approval.
- `task_work_queue` — auto-creates tasks for approvals / exceptions / follow-ups / SLA breaches; reassign with reason; manager workload view.
- `support_tickets` — categories per area, SLA by priority, link to any entity, replies notify school.
- `reports_exports` — role-scoped, sensitive exports need reason+approval+watermark, every export audited.
- `security_audit_console` — high-risk list, reason required, dual-approval, append-only audit, monthly access review.
- `admin_settings`, `roles_permissions`, `company_dashboard` (role-aware command center + alerts).

## Open questions for the user
1. Credit/waiver path: payment-gate accepts `approved_credit` / `approved_waiver` — who approves those, and is it in MVP?
2. Online/hybrid exam mode exists in `exam_slots` (MVP=physical). Confirm MVP is physical-only.
3. Re-evaluation and public result lookup are tagged "Later" — confirm out of MVP.
