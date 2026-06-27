## CRM / OUTREACH MODULE (built this session — source-driven, 15/15 gates)
Funnel: [x] Import wizard (OJ-O1) · [x] School directory (OJ-O2: search/filter/paginate/edit/delete/bulk/status-aware-icons/more-view) · [x] Email campaigns (OJ-O3: Mode A send-here targets target_ids+merge-tags->email_sends; Mode B create_in_brevo->provider shell) · [~] Sends/tracking (OJ-O4+webhook). Lifecycle: prospect->lead->registered->approved (+rejected/blocked/inactive); reject vs block distinct; activate/deactivate. School does register/submit (via email link), staff does approve/reject/block/activate/deactivate/unsubscribe. Cross-cutting (central): Lucide icons (icon_map.json + /lucide.js + /iconpicker); per-kind live validation; reference dropdowns + server-side pincode kernel (/api/pincode); sectioned forms; UTC->viewer-local timestamps; KPI dashboards + steppers + app-shell. New gate check_portal_forms. See .remember/remember.md for full handoff.
NEXT: campaign feature-picker page (iconpicker-style) at /campaignspec -> JSON scope -> rebuild OJ-O3.

## §11 UX PATTERNS (source-driven, gen_portal)
KPI section dashboards (1-line cards + See more accordion, the section's default page) · process stepper (entity lifecycle states + live per-stage counts) atop each workflow screen · click-any-row -> detail modal. Declared in BRD §11 (kpi_dashboard/process_stepper/row_detail_modal) + spec/app_shell.json ui block; projected by gen_portal onto all portal pages.

## APP SHELL / NAV (UI done; features pending-wire)
Universal top bar declared in spec/app_shell.json (one source -> every portal page via gen_portal). Grouped+ordered side nav (both portals, most-used first). UI placeholders awaiting their own build (the norm: source -> derive -> gen, wired one-by-one): NOTIFICATIONS (needs a notifications entity + feed), PROFILE + ACCOUNT SETTINGS (users profile, auth-last), LOG OUT (sessions, auth-last). Clicking them alerts 'wires at auth-last'.

# v2 BUILD STATUS — the live dashboard (READ FIRST · always current)

**Updated:** 2026-06-27 (J1-J10 COMPLETE) · **Branch:** `v2` (`main` = frozen v1 fallback at 72dc69a)
**Prove the whole thing anytime:** `python versa-oms/generators/gates/run_all.py` → expect **13/13 green**
This file is updated at the END of every step (robot / gate / journey) and committed. If a session or network
drops, READ THIS to know exactly where we are. (CLAUDE.md auto-loads + points here; `generators/ROBOTS.md` = full contracts.)

## ▶ RIGHT NOW
- **CURRENT TASK:** J1-J10 + effect chains + §09 status enums + identity rules (candidate_id auto-gen, omr_candidate_match) ALL done. Next: auth (LAST) + apply Postgres.
- **NEXT:** auth (LAST — login/RBAC/RLS + check_access) · apply 0001_schema.sql to Postgres for production

## Robots (generators) — 8/8 ✅
`derive_specs` · `derive_canonical` · `derive_catalog` · `gen_db` · `gen_services` · `gen_routes` · `gen_rules` · `gen_screens`
(all green; each robot's contract is in its file header; run any with `python versa-oms/generators/robots/<name>.py`)

## Gates (inspectors) — 13/13 green ✅
`check_canonical`⭐ · `check_spec` · `check_catalog` · `check_chain` · `check_security` · `check_design` ·
`check_generated` · `check_intent` · `check_census` · `check_module` · `check_journey` · `check_masking` · `check_dependencies`
**Deferred (correctly):** `check_access` (RBAC → auth-last) · `change_control`/`versioning`/`runbook` (process → last)

## §09 STATUS ENUMS + IDENTITY RULES (done)
Every entity's status field carries its authoritative §09 enum (validation + DB CHECK union the workflow handoff states); omr_imports' missing status column was filled. candidate_id is auto-generated (unique+stable, §18) when not provided; matchOmrCandidates enforces §10 (every scanned candidate in the roster, no duplicates). Proven in app/identity_rules_proof.ts.

## EFFECT CHAINS (done) — the participation spine auto-advances
When an artifact stage completes, the linked participation jumps to its §09 milestone (forward-only): payment->paid, materials->materials_released, omr-approve->exam_completed, results-publish->results_published, cert-issue->certificates_released (2-hop via result_id). Declared in `participation_effects` (supplement); `check_chain` enforces every effect resolves.

## RULE (enforced)
Every generated screen is COMPLETE — list + **scrollable modal create** + EVERY lifecycle action button + **wired design icons** (nav/search/buttons) + scrollable side panel. `check_design` fails any half-baked screen (missing action / not-a-modal / no-icons).

## Data-model decision (founder-confirmed 2026-06-27)
Workflows govern entities via an EXPLICIT `workflow_entity` map (BRD left it blank) in `source-of-truth/v2_supplement/`. Roster = **participations** (a school runs many olympiad cycles at once; `students` are CRUD roster rows linked by `participation_id`). Identity spine sound: `candidate_id` UNIQUE = the OMR-sheet key; `results.student_id`→`students` is a real FK (v1's gap, closed). `check_chain` enforces every workflow→real entity.

## Foundation — wired ✅
`app/runtime/db.ts` (in-memory; swap for Postgres at deploy) · `app/runtime/envelope.ts` · `tsconfig.json` (@/ aliases).
J1+J2 run: `cd versa-oms && npx tsx app/school_journey_proof.ts`.
**See it (violet UI):** `cd versa-oms && npx tsx app/dev_server.ts` → http://localhost:3400/schools.html

## OUTREACH MODULE (in progress, source-driven)
New module for the 17k school directory + email campaigns. Phase 1 DONE: 3 entities (school_imports, email_campaigns, email_sends) + schools extension (website/level/source/unsubscribed/last_contacted_at/import_id) + 3 lifecycles — ALL declared in the supplement (field_additions + supplement_workflows), generators enhanced to read them (derive_specs field_additions, derive_catalog supplement_workflows). 17 entities, FKs clean, no orphans. NEXT: OJ-Outreach portal · two-channel EmailGateway + Brevo adapters (signed kernels) · import+campaign flow · address-at-registration precondition.

## NO HARDCODING (done)
All proofs + the dev seed pull test data from `gen_fixtures` (`sample(entity, {overrides})`, valid values derived from canonical — auto-ids/FKs/status excluded). The dev seed's readable demo values come from a declared source `spec/demo_data.json` (not inline literals); it uses the real registration→auto-participation→auto-open flow. Zero hardcoded field values in app/.

## SCHEMA/RULE UPDATES (2026-06-27, all source-driven)
BRD: schools address fully structured (address_line1/2, locality, **pincode** required, 6-digit) for courier labels; school onboarding ends at **approved** (no manual open_student_upload). Supplement: participation starts **submitted** on register; **cascade effect** — school approval AUTO-OPENS its participation(s) for upload. Generators: gen_rules compiles N-digit format checks; gen_services compiles cascade effects; **gen_fixtures** (NEW) emits valid sample records from canonical so proofs/seed never hardcode field values (`sample("schools", {...})`).

## OJ2 — Schools acquire→onboard (CRM, done)
Staff create a lead (OJ2.1) -> convert/submit_registration (OJ2.2, which auto-creates the participation) -> approve (OJ2.3) -> open student upload (OJ2.4). Both entry doors (public SJ1 self-register + staff OJ2.1) converge on submit_registration. Declared `registration_creates_participation` (supplement). Proven in app/crm_journey_proof.ts. Sub-step naming convention: OJ<n>.<m> / SJ<n>.<m>.

## PORTALS — school portal NOT yet wired
Back-end pipeline (J1-J10) + lifecycles + effects + identity rules: DONE. But the generated UI is 14 per-ENTITY admin screens, NOT the BRD's two portals. **School portal = the SJ series (SJ1-SJ12), FROZEN in `spec/SCHOOL_JOURNEYS.md`** — journey-shaped, `own_school_only` scoped (scoping wires at auth). Staff portal = the OJ series (OJ1-OJ9), FROZEN in `spec/STAFF_JOURNEYS.md`, generated to `/staff/`. BOTH PORTALS DONE (gen_portal, 2 portals, 20 screens): SCHOOL /portal/ (SJ1-12, scoped) + STAFF /staff/ (OJ1-9, all-schools) — journey-shaped, violet, wired to the API. check_portal gate (14 gates). NEXT: AUTH (login + own_school_only scoping for SJ + role-gating for OJ + check_access), then Postgres.

## Journeys (the operations pipeline) — J1 ✅
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
