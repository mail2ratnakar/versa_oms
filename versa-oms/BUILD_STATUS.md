# v2 BUILD STATUS — the live dashboard (READ FIRST · always current)

**Updated:** 2026-06-27 (J1-J10 COMPLETE) · **Branch:** `v2` (`main` = frozen v1 fallback at 72dc69a)
**Prove the whole thing anytime:** `python versa-oms/generators/gates/run_all.py` → expect **13/13 green**
This file is updated at the END of every step (robot / gate / journey) and committed. If a session or network
drops, READ THIS to know exactly where we are. (CLAUDE.md auto-loads + points here; `generators/ROBOTS.md` = full contracts.)

## ▶ RIGHT NOW
- **CURRENT TASK:** J1-J10 COMPLETE — full pipeline runs + gated. Next: participation-spine effects, candidate_id auto-gen, then auth (last).
- **NEXT:** effect chains (auto-advance participation milestones) · §09 status-enum derivation · auth (LAST)

## Robots (generators) — 8/8 ✅
`derive_specs` · `derive_canonical` · `derive_catalog` · `gen_db` · `gen_services` · `gen_routes` · `gen_rules` · `gen_screens`
(all green; each robot's contract is in its file header; run any with `python versa-oms/generators/robots/<name>.py`)

## Gates (inspectors) — 13/13 green ✅
`check_canonical`⭐ · `check_spec` · `check_catalog` · `check_chain` · `check_security` · `check_design` ·
`check_generated` · `check_intent` · `check_census` · `check_module` · `check_journey` · `check_masking` · `check_dependencies`
**Deferred (correctly):** `check_access` (RBAC → auth-last) · `change_control`/`versioning`/`runbook` (process → last)

## RULE (enforced)
Every generated screen is COMPLETE — list + **scrollable modal create** + EVERY lifecycle action button + **wired design icons** (nav/search/buttons) + scrollable side panel. `check_design` fails any half-baked screen (missing action / not-a-modal / no-icons).

## Data-model decision (founder-confirmed 2026-06-27)
Workflows govern entities via an EXPLICIT `workflow_entity` map (BRD left it blank) in `source-of-truth/v2_supplement/`. Roster = **participations** (a school runs many olympiad cycles at once; `students` are CRUD roster rows linked by `participation_id`). Identity spine sound: `candidate_id` UNIQUE = the OMR-sheet key; `results.student_id`→`students` is a real FK (v1's gap, closed). `check_chain` enforces every workflow→real entity.

## Foundation — wired ✅
`app/runtime/db.ts` (in-memory; swap for Postgres at deploy) · `app/runtime/envelope.ts` · `tsconfig.json` (@/ aliases).
J1+J2 run: `cd versa-oms && npx tsx app/school_journey_proof.ts`.
**See it (violet UI):** `cd versa-oms && npx tsx app/dev_server.ts` → http://localhost:3400/schools.html

## Journeys (the spine) — J1 ✅
- **J1** Acquire school (CRM lead → convert) — ✅ runs + gated (`check_journey`)
- **J2** Onboard school (approved → students_open) — ✅ runs + gated
- **J3** Roster (participations: upload→validate→finalise→lock) — ✅ runs + gated ·
- **J4** Payment (payments: draft→paid→reconciled) — ✅
- **J5** Slots (exam_slots: open→selected→slot_confirmed; staff-predefined + school choice) — ✅
- **J6** Materials (exam_materials: draft→approved→scheduled→released, time-gated) — ✅
- **J7** Capture (courier_batches pending→…→closed + omr_imports) — ✅
- **J8** Evaluate (omr_imports: awaiting_import→imported→reviewed→approved; candidate match) — ✅
- **J9** Results (results: draft→…→published, keyed to student_id FK) — ✅
- **J10** Certificates (certificates: generated→issued + stateless verify) — ✅
- **Identity spine PROVEN**: candidate_id → student → result(student_id FK) → certificate(student_id+result_id FK)

## Deferred to the end (by founder decision)
- **Auth** (login / RBAC / sessions + `check_access` + `0002_rls.sql`) — built **LAST**
- **Apply `0001_schema.sql` to Postgres** (swap the in-memory db) — for production go-live

## Sources (the only hand-authored truth — 5)
brain · skills · questions (questionnaire) · responses (olympiads BRD, the anchor) · design (versa_design_system.html, violet).
Plus `source-of-truth/v2_supplement/` (the `users` entity, no Directus, 22 roles frozen).
