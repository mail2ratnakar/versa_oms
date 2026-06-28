# CLAUDE.md — v2 — READ FIRST, EVERY TURN, BEFORE ANY ACTION

This is the operating contract for the **v2 rebuild**. v2 starts from FIVE sources only and DERIVES
everything else. Read this → **`versa-oms/BUILD_STATUS.md`** (the live dashboard — exactly where we are +
what's next, updated every step) → **`generators/ROBOTS.md`** (full robot/gate contracts + how to verify each)
→ brain → skills → master process, before you touch anything. (`main` is the frozen v1 fallback; not an input to v2.)

## THE CONCEPT (why this exists)
**Centrally standardized, spec-driven, PRODUCTION-GRADE "vibe coding":** the founder states intent
conversationally; the system MATERIALIZES it — correct, complete, traceable — with zero hand-written mess.
The discipline that makes that possible is ONE loop:

> **intent → spec → generate → gate → prove.**

Every fact lives in exactly ONE place and is PROJECTED everywhere by generators. Humans edit sources, never outputs.

## THE VERSA SANDBOX BET (this IS the product — protect it every turn)
**THE SPINE — declare it, run it, never skip a link:**
> `SOURCE (the 5 keepers) → DERIVE (per-concern robots) → GENERATE → GATE (all green) → PROVE (journey + a fail-closed negative)`

Every turn, before you write anything or claim anything done, walk the spine: (1) did the fact land in **SOURCE**?
(2) did a **ROBOT** project it (not your hands)? (3) is **EVERY GATE green** (currently 19)? (4) is it **PROVEN** by a
test? If any link is skipped — a hand-written governed file, a fact typed into a generator, a non-green gate, a visual
edit that wrote code, an unrun robot, a reproducibility receipt left un-regenerated — **STOP: that is the bug, not the
feature.** The entire moat is that every competitor skips a link and we never do; missing the spine once forfeits it.

The framework is not scaffolding for one app; **the framework IS the product: Versa Sandbox** — a deterministic
"vibe-coding" system where ONE source of truth + Python derivers + executable gates build a production-grade app
from conversational intent, fully traceable. Research (`research/versa_sandbox_research.md`,
`versa-oms/VERSA_SANDBOX.md`) confirms the prize: the entire 2025 field (v0/Bolt/Lovable/Cursor/Kiro/Tessl) converged
on this exact loop yet **NO ONE has closed it** — all generate from a non-deterministic LLM with no source-of-truth
system of record, no requirement→code trace, and no ENFORCED gate (their rules files are advisory). **The edges you
must protect every turn — deviating forfeits the one thing no competitor has achieved:**
- **The GATE — not the generator — guarantees correctness.** LLMs aren't deterministic even at temp 0; a stage is
  done only when its gate is green.
- **Single source of truth → downstream derivations.** Every fact is authored ONCE in source and PROJECTED by a
  generator. Never hand-type a derived fact; never let a generator hold a fact; edit source, regenerate (#4/#6/#8).
- **The visual/annotation layer FEEDS the source, never the generator** (#8/#9) — the parallel-write-path that sinks
  every competitor.
- **Reproducibility is recorded + gated** — `gen_manifest` (VERSIONS + content hashes) is the receipt; same source +
  versions = byte-identical output. **Completeness is interrogated** — `check_5w1h` won't let a feature be "done"
  until Who/What/Where/When/Why/How are all answered.
Any deviation — a hand-written governed file, a fact in a generator, a relaxed gate, a visual edit that writes code —
is a bug that forfeits the moat. This is why the discipline is non-negotiable.

## THE FIVE SOURCES (the only hand-authored truth on v2)
1. **brain** — `spec/brain/` — the doctrine: what "complete / production-grade" means; the stop conditions.
2. **skills** — `spec/skills/` — the methodology: how to run each step of the pipeline.
3. **questions** — `generators/spec_playbook/config/questionnaire_schema.json` (+ the question set) — the
   interrogation that, fully answered, completely specifies a system.
4. **responses (function)** — `source-of-truth/` — the founder's answers; THIS system's scope (BRD-led).
5. **design (form)** — `source-of-truth/design/versa_design_system.html` — the visual language: tokens (12
   colors, 6 themes), the component library, icons, and the "No Raw CRUD UI" patterns. `gen_screens` derives
   from it; `check_design` enforces it.

If a file is not one of these five and not generated from them, it does not belong on v2.

## THE AUTHORITATIVE SOURCE (the merge — Track B anchors)
The responses are TWO complementary tracks. **Track B — the olympiads BRD — is the ANCHOR and the data-model
authority.** Its complete, keyed data model (entities · identity keys · FK relationships) is the law. **Track A
— the company questionnaire — folds in** as the staff-operations layer (the 7 A-only modules B doesn't model
get B-style data models authored). NEVER build an entity, key, or relationship that isn't in this merged
source. Reconciliation map: `source-of-truth/SCOPE_RECONCILIATION.md`.

## THE MODULE UNIT (every module is the SAME shape — the 14+1 contract)
A module is a self-contained set of JSON specs: the **14 playbook parameters** (modular structure · metadata ·
feature & bug continuity · dependency map · lifecycle states · security · data-classification · access-matrix ·
change-control · versioning · runbook · architecture — `generators/spec_playbook/config/playbook_14_parameters.json`)
**+ the 15th: DATA MODEL** (entities · identity keys · FK relationships) — the dimension the 14 lacked. The flow:
**spec → module → its JSONs → generators → wired code.** Generators are PER-CONCERN (one script per concern,
looping all modules — DRY, no duplicated logic), but EVERY module is wired through its own JSONs and validated
by its OWN gate (`check_module`). Modular: a module can't break another; rollback = revert one module's specs.

## THE MASTER PIPELINE (each stage has a generator AND a gate)
`SKILLS → SOURCE OF TRUTH → BUILD CONTROL → ARCHITECTURE → SECURITY/PRIVACY/THREAT → API CONTRACT →`
**`DATA MODEL`** `→ EFFECT CHAINS → SCREEN CONTRACTS → JOURNEY TESTS → FOUNDATION → MODULE CODE → TESTS → CI → STAGING → PROD.`
No stage is done until its gate is green. No feature is complete unless its effect chain, screen contract,
and journey test are complete.

## THE NON-NEGOTIABLES (these are why v1 had to be deleted)
1. **GATES ARE THE SPEC.** The gate is the executable definition of "production-grade"; a stage is done only
   when its gate is green. v1 died because the gates were INCOMPLETE — they passed green on a broken system.
   **Completeness of the gates = correctness of the system.**
2. **QUESTIONS ⇄ GATES ARE DUALS.** For every class of fault there must be a QUESTION that elicits it (so
   intent can't omit it) AND a GATE that enforces it (so generation can't violate it). v1's fatal gap — an
   unkeyed identity spine — had NEITHER. When you find a new fault-class, add BOTH.
3. **DATA-MODEL INTEGRITY IS FIRST-CLASS.** Every entity has a stable IDENTITY KEY. Every relationship is a
   real FOREIGN KEY — never a synthetic string used as a join. No orphan entities. No specced-but-dead tables.
   Every lifecycle chain wired end-to-end. v1's BRD specced this CORRECTLY; the BUILD diverged from it with no
   gate to catch it (it invented an unkeyed `candidate_results`). The fix is the GATE — `check_canonical`,
   build-matches-BRD — at the front of the pipeline. Not new questions; the question already existed.
4. **DERIVE, DON'T AUTHOR.** One source per fact. If a source implies a fact, PROJECT it through a generator —
   never re-type it. Hand-typing a fact that already exists IS the bug.
5. **NO HAND-WRITTEN CODE in the governed surface.** Every file is GENERATED (from a source), FROZEN-KERNEL
   (signed irreducible primitive), or FROZEN-DEBT (signed, deliberate). A new hand-written file fails the census.
6. **EDIT THE SOURCE, THEN REGENERATE.** Never hand-edit generated output.
7. **NO HARDCODED DATA.** Test data is DERIVED (`gen_fixtures` -> `sample(entity, overrides)`); demo/seed data is DECLARED (`spec/demo_data.json`). NEVER paste field-value literals inline in code, tests, or seeds — a schema change must FLOW, not require edits. (Only exception: a deliberately-invalid payload to test a 422.)
8. **VISUAL TOOLS FEED THE SOURCE, NEVER THE GENERATOR.** The annotate layer (`/annotate`), the pickers
   (`/iconpicker`, `/campaignspec`, `gen_visualspec`), and any visual builder emit JSON that is **INTENT, not the
   build**. That JSON MUST be folded **into the source-of-truth** (`source-of-truth/olympiads_brd/*.csv` +
   `source-of-truth/v2_supplement/*.json`, plus the journey/compose spec it implies) — the **one and only source**
   — and then PROJECTED downward by `derive_*` → canonical/catalog → `gen_*` robots → screens, propagated centrally.
   **SCREEN COMPOSITION** — which fields a screen shows, their **prefill / data bindings**, and its **actions** — is
   **DECLARED in source and PROJECTED by `gen_portal`**; it is **NEVER hand-typed as HTML/JS facts inside a
   generator** (the way the `manage` shape derives fields from canonical via `form_fields` — every shape must do the
   same). A generator that contains entity/field/screen FACTS is the bug — move them to source. This is #4 (derive,
   don't author) + #6 (edit the source, then regenerate), made explicit for UI/flow. When you find such a fact in a
   generator, add the matching gate (#2 questions⇄gates): the screen's fields must trace to the spec/canonical.
9. **THE ANNOTATE LAYER IS A LIVE MIRROR OF THE PORTAL.** `/annotate` (`gen_annotate`) loads the ACTUAL generated
   screens via live iframes — it must ALWAYS reflect the current portal exactly. EVERY change to a screen / UI / UX /
   component REQUIRES re-running `gen_annotate` (it is part of the regenerate sequence) so its screen list + overlay
   mirror the real pages 1:1. The annotate JSON you then produce on that mirror is the INTENT that folds back into
   source (#8). Never let annotate drift from the live portal.

## THE MOTION
`SOURCE (4 keepers) → DERIVER → specs / canonical / catalog → GENERATOR → code → GATE → PROVE.`
You only ever edit the four sources (or a signed kernel). Never the derived output.

## FROZEN — THE BUILD PLAN (robots · gates · journeys · standing rules)
**Standing rules:** Anchor = **Track B (BRD)**; A folds in; nothing off-spec. · Module = **14 params + DATA
MODEL (15th)**. · Generators = **per-concern logic, per-module wiring + per-module gate**. · **`check_canonical`
rejects any fake ID / broken link before code is built**. · **Auth/login is wired LAST** — build open +
browsable; the staff actor is assumed during the build.

**The 8 robots (generators, per-concern):**
1. `derive_specs` — merged BRD/responses → per-module JSON specs (15-param set)
2. `derive_canonical` — specs → canonical data model (entities · keys · FKs)
3. `derive_catalog` — specs + canonical → rule catalog (validation, scope, lifecycle, effect, masking, approval, eligibility)
4. `gen_db` — canonical → SQL migrations + RLS
5. `gen_services` — canonical + catalog → module services (CRUD + lifecycle)
6. `gen_routes` — specs → API route handlers
7. `gen_rules` — catalog → compiled enforcement (validators, guards, effects, eligibility, masking)
8. `gen_screens` — specs + **design source (#5)** → screens, pages, components, nav

**The 10 inspectors (gates):**
`check_intent` · `check_spec` · **`check_canonical`** (keyed · real FKs · connected · no off-spec entity · no
dead tables) · `check_chain` (workflows wired end-to-end) · `check_catalog` · `check_generated` · `check_census` ·
`check_module` · `check_journey` · `check_design` (UI matches the design system / no-raw-CRUD).

**The journey spine (build in this order; one slice end-to-end before the next):**
J1 Acquire school (CRM lead → convert) · J2 Onboard (verify → approve → active) · J3 Roster (students → lock →
candidate IDs) · J4 Payment (link → paid) · J5 Slots (create → publish → book) · J6 Materials (generate → release
→ download) · J7 Capture (OMR scan/upload) · J8 Evaluate (score vs key) · J9 Results (generate → approve →
publish) · J10 Certificates (generate → publish → verify/download). **First slice = J1.**

## BEFORE YOU CLAIM DONE
Every relevant gate green · the journey proven (positive + a fail-closed negative) · completed/pending
reported with evidence. Never claim "complete / production-ready" without it. Stop and ask the founder on the
brain's stop conditions, or before relaxing any constraint.
