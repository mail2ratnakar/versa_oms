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

**RESOLVED FINDING (Robot 2 caught it; fixed at the SOURCE):** the BRD referenced `directus_users` (Directus's
auth table) but never declared it. **There is no Directus on v2.** Declared a frozen **`users`** entity (id ·
email · 22 roles from Q11 + BRD actors · status) in `source-of-truth/v2_supplement/data_model_supplement.json`;
Robot 1 reads it + maps `directus_users → users`. Re-ran Robots 1–2 → **canonical GREEN** (14 entities · all
FKs resolve · 0 orphans · 0 cycles). The `users` AUTH BEHAVIOUR (login/RBAC) is still built LAST; only the
entity is declared. This is the full loop: caught gap → fix source → re-run → green.
| 3 | `derive_catalog` | ✅ **DONE** (lifecycle + validation) | BRD (07 workflows, 10 validation) + canonical → `spec/derived/rule_catalog.json` | extract-only · traceable (every rule has a BRD source) · real targets · idempotent · declarative-only | `python .../derive_catalog.py` → 10 workflows, 38 transitions, 27 validations |

**ROBOT 3 NOTES:** Today extracts **lifecycle** (07) + **validation** (10). Remaining rule types layer from
their BRD sections: scope (03/10), effect (06/07), masking (16 + data_classification), approval (17),
precondition (07 guards), eligibility (authored). Two patterns it flagged to FORMALISE in check_catalog (not
bugs): (a) **wildcard transitions** `any->X` (e.g. block from any state) — `any` is a meta-state; (b)
**cross-cutting validations** on meta-entities (`all_school_scoped_entities`) — apply to a SET of entities,
not one. Both are legitimate; the catalog/check_catalog must recognise them rather than reject.
| 4 | `gen_db` | ✅ **DONE** (schema; RLS deferred to auth) | canonical → `spec/derived/migrations/0001_schema.sql` | derived-only · referential (FK REFERENCES target(id)) · build-order · column rules (NOT NULL/UNIQUE/enum CHECK) · idempotent · **FK cols forced to uuid to match PKs** | `python .../gen_db.py` → 14 tables, 25 FK constraints, all FK cols uuid |

**ROBOT 4 NOTES:** Emits the open/browsable schema (tables + FKs + CHECKs). The DB now PHYSICALLY rejects a
fake FK or disconnected row (Postgres, not just a gate). RLS (school scoping) needs the auth context →
emitted in the AUTH phase as `0002_rls.sql` (auth-last). Caught + fixed: BRD types FK fields as
"many-to-one X" (a relationship, not a column type) → gen_db forces FK columns to `uuid` so they match the
`uuid` PKs and the migration applies cleanly. Applying to a fresh v2 Postgres is a later deployment step.
| 5 | `gen_services` | ✅ **DONE** (CRUD + lifecycle) | canonical + catalog → `spec/derived/services/<entity>.service.ts` | derived-only · lifecycle-enforced (illegal transitions throw) · validation delegated to gen_rules · idempotent · thin-over-kernel | `python .../gen_services.py` → 14 services, 7 with enforced state machines |

**ROBOT 5 NOTES:** Each service = typed CRUD + a `transition<E>(id, action)` whose `TRANSITIONS` map IS the
catalog's declared transitions — an illegal jump (e.g. `approve` from `lead`) throws. create/update call
`validate<E>()` (from gen_rules, Robot 7 — one source for validation). Services depend on `../runtime/db`
(a frozen data kernel, to be added) + `../rules/<e>.rules` (gen_rules). Effect chains (what happens AFTER a
transition) layer in once `derive_catalog` extracts the `effect` rule type.
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
