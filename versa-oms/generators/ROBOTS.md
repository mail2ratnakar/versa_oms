# v2 — Robots & Inspectors Registry (the integrity anchor — read with CLAUDE.md)

Any session/LLM: this file + `CLAUDE.md` tell you the entire build state. Each robot's full contract lives
in its own file header; this is the index, status, and how-to-verify. **A robot is "done" only when its
output passes its inspector — never trust, RUN.**

## Pipeline
`5 SOURCES (brain · skills · questions · responses/BRD · design) → ROBOTS → GATES → JOURNEYS (J1..J10)`
Anchor = Track B (BRD). Nothing off-spec. Generators per-concern, per-module wiring + per-module gate.

## The 8 robots
| # | Robot | Status | Input → Output | Integrity (invariants) | How to verify |
|---|-------|--------|----------------|------------------------|---------------|
| 1 | `derive_specs` | ✅ **DONE** (data-model pass) | BRD → `spec/derived/data_model.json` | faithful (every entity/field/FK traces to a BRD row) · **key ≠ identifier** (uuid `id` joins; `candidate_id` is display-only) · real FKs only · idempotent · extract-only | `python versa-oms/generators/robots/derive_specs.py` → 13 entities, all keyed, 25 FKs; `candidate_results` absent |
| 2 | `derive_canonical` | ✅ **DONE** | `data_model.json` → `spec/derived/canonical.json` | derived-only · resolve-don't-drop (surfaces unresolved FKs) · bidirectional graph · build-order + cycle detection · orphan detection · idempotent | `python .../derive_canonical.py` → build order computed; **FOUND** 4 FKs → undeclared `directus_users` |

**OPEN FINDING (from Robot 2 — a source decision, not a robot bug):** the BRD references `directus_users`
(Directus's built-in auth user table) for `audit_events.actor_user_id`, `omr_imports.uploaded_by/approved_by`,
`school_users.directus_user_id`, but never declares it in the data schema. On v2 (no Directus) this must
become a declared **`users`** entity (the staff/auth users) — built in the AUTH phase (last, per auth-last)
but **declared now** so the graph resolves and `audit_events` stops being an orphan. Until declared,
`canonical.integrity.all_fks_resolve = false` (correctly — the model is incomplete).
| 3 | `derive_catalog` | ⬜ | specs + canonical → `spec/derived/rule_catalog.json` | every rule traces to a BRD source; 8 rule types | check_catalog |
| 4 | `gen_db` | ⬜ | canonical → migrations + RLS | tables match canonical exactly; FKs enforced in SQL | check_generated |
| 5 | `gen_services` | ⬜ | canonical + catalog → module services | CRUD + lifecycle per spec | check_module |
| 6 | `gen_routes` | ⬜ | specs → API routes | match BRD API actions (08) + status codes (09) | check_generated |
| 7 | `gen_rules` | ⬜ | catalog → compiled enforcement | validators/guards/effects/eligibility/masking | check_module |
| 8 | `gen_screens` | ⬜ | specs + design source (#5) → screens/pages/components/nav | matches design tokens; no-raw-CRUD | check_design |

## The 10 inspectors (gates)
`check_intent` · `check_spec` · **`check_canonical`** (keyed · real FKs · connected · no off-spec entity · no dead tables) ·
`check_chain` · `check_catalog` · `check_generated` · `check_census` · `check_module` · `check_journey` · `check_design`.

## Journey spine (build order — one slice end-to-end before the next)
J1 Acquire school (CRM lead → convert) · J2 Onboard · J3 Roster · J4 Payment · J5 Slots · J6 Materials ·
J7 Capture (OMR) · J8 Evaluate · J9 Results · J10 Certificates. **First slice = J1.**

## Rule for every robot (so context never drifts)
1. Its file header is its CONTRACT (purpose · input · output · invariants · verify · do-not). Read it before touching.
2. Output is GENERATED — never hand-edit. Edit the SOURCE (BRD/design), then re-run the robot.
3. "Done" = its inspector is green. Update this table's Status only then.
