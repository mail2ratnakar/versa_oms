# Scope Reconciliation — Track A vs Track B (2026-06-26)

Resolves the two-track ambiguity that caused v1's duplicate/diverged models. Verdict: the tracks are
**complementary, not duplicate.** Track B is the authoritative spine; Track A adds the staff-operations layer.

## The two tracks
- **Track A — Company Portal questionnaire** (200 Q, 19 modules). The internal staff-operations layer:
  who-does-what, permissions, approvals, lifecycle stages. **No data model.**
- **Track B — Olympiads Master BRD** (1,358 rows, 20 sections incl. a 178-row Data Schema). The core
  olympiad domain (exam → result → certificate) + school/student-facing side, with a **complete, correctly
  keyed data model** (13 collections, real FK relationships), API contracts, workflows, screens, files,
  integrations, security, tests, deployment.

## The map (19 Track-A modules vs Track-B data model)

**OVERLAP — B has the data model + workflow; A adds the staff-ops view (12 modules).**
`school_onboarding_ops · student_roster_ops · finance_ops · exam_slot_ops · exam_material_ops · courier_ops ·
evaluation_ops · results_ops · certificate_ops · notification_ops · security_audit_console · roles_permissions`
→ B's data model is authoritative (schools, students, participations, exam_slots, exam_materials, omr_imports,
results, certificates, payments, courier_batches, audit_events, permissions). A's staff-operations behaviour
(approvals, reasons, dual-approval, SLAs) folds in as the company-portal layer on those entities.

**A-ONLY — pure staff-ops, NO entity in B (7 modules). These are Track A's real net-new contribution.**
`company_dashboard · staff_users · school_crm · support_tickets · task_work_queue · admin_settings · reports_exports`
→ B never modeled these. They need a **data model authored in B's style** (entities, identity keys, FK
relationships) — and they are the **highest risk for repeating the identity break** if authored without it,
because A only ever specced them functionally.

**B-ONLY — what A doesn't formalize at all.**
The entire data model (keys + relationships), API contracts (08), status/response codes (09), validation
rules (10), integrations (12: razorpay, docuseal, listmonk, omrchecker), files & signed URLs (13), the
school/student/parent-facing domain, and deployment/ops runbooks (19–20).

## Conflicts (minimal at the spec level)
- **`candidate_results`** was a **build invention — in NEITHER spec.** Both A and B say `results`. So the v1
  break was a build divergence, not a spec conflict.
- Role sets overlap (A's staff roles ≈ B's actors/roles); reconcile names during authoring — minor.

## The single authoritative source (the merge)
**Track B (the BRD) is the spine and the data-model authority.** Produce ONE merged source = B, extended by:
1. **Author B-style data models for the 7 A-only modules** (CRM, tasks, support, settings, staff, internal
   dashboard, reports) — entities, identity keys, FK relationships. *This is the main net-new authoring.*
2. **Fold A's staff-ops behaviour into the 12 overlapping modules** (B's entities + A's approvals/SLAs/reasons).
3. Carry B's data model verbatim for the core olympiad domain.

Result: one source of truth with a complete, keyed data model across **all 19 modules** — and the build is
then gated against it (`check_canonical` / build-matches-BRD), so a `candidate_results`-style off-spec
invention fails instantly.

## Next
Lock this map. Then v2 builds from the merged source, data-model-first, one module end-to-end, gated.
