# Spec-Driven Method — the rule, the layers, the pipeline

This is the contract for how Versa OMS is built. It exists because we drifted:
when the generic generators produced thin output, we hand-coded the richness
(a bespoke `CrmView`, hand-written page config) instead of enriching the **spec**
and the **generator**. That is the anti-pattern. This document prevents it.

## The one rule
**Never hand-edit a per-module artifact. Change the spec, then regenerate.**
Generated files carry a header: `// GENERATED … DO NOT EDIT`. If you need different
behavior, edit the spec and re-run its generator — never the output.

## The single-source rule (no parallel specs) — added 2026-06-23
**Before introducing a new spec field/file/generator for a concept, find the spec that
already OWNS that concept and generate from it. Never create a second declaration.**
Reading a module's specs is not enough — you must also place new work in the *correct
existing home*. (We violated this once: `workflows.json` already declared a `school_active`
guard, but the precondition enforcement was re-authored in `chains.json`. Fixed: guards are
now generated from `workflows.json guards[]` via `guard_checks.json`; `chains.json` holds
effects only.)

### Concept-ownership map (the single source for each concept)
| Concept | Single source | Generator → output |
|---|---|---|
| entities / columns | `spec/core` + `spec/modules/<m>/schema.json` → canonical model | migrations |
| state machine (transitions, from→to) | `workflows.json` | `gen_modules` (service transitions) + `gen_guards` (transitionGuards) |
| **guards / preconditions** | `workflows.json guards[]` (+ `guard_checks.json` = how) | `gen_guards` → transitionPreconditions |
| **cross-module effects** | `spec/effects/chains.json` | `gen_effects` → transitionEffects |
| page / screen | `spec/screens/<m>.screen.json` | `gen_screens` |
| action service + routes | `spec/actions/<m>.actions.json` | `gen_actions` |
| permissions / RBAC | `permissions.json` | `gen_modules` |
| change requests | `spec/modules/<m>/feature_requests/` | — |

`gen_guards.py` now also reports **declared-but-UNMAPPED guards** — workflow guards with no
enforceable check in `guard_checks.json` (currently ~12 across modules, e.g. roster
`validated`/`no_blocking_duplicates`). These are tracked enforcement gaps; add a check
mapping (and a CR) to close each.

## The spec-adherence rule (check before you build)
Before implementing any feature/chain, READ the relevant module's spec files under
`spec/modules/<m>/` and honor them — they encode requirements the generators don't yet
read: `security.json` (controls), `*_policy.json` (business rules), `workflows.json`
(transition guards + edges), `lifecycle_states.json`, `validations.json`, `data_classification.json`.
A declared guard/control that the code doesn't enforce is a defect, not a non-issue.
Example: `workflows.json` for student_roster_ops declared a `school_active` guard on
`lock_roster` that was never enforced — CHAIN-003 added a precondition (FR-STUDENT-ROSTER-OPS-2026-0001)
to honor it. When you find such a gap, file a CR and close it.

## Two layers (don't confuse them)
| Layer | Examples | Hand-written? |
|---|---|---|
| **Framework / engine** (module-agnostic, reusable) | `components/ModuleTable.tsx`, `server/lib/defineModule.ts` (kernel), the generators, `server/lib/transitionGuards.ts` (engine) | ✅ Yes — this is the platform, like Next.js itself |
| **Per-module artifact** (one per module/feature) | each module's **page**, route, service, schema, screen, effect-chain, guard-data | ❌ No — MUST be generated from a spec |

The drift was putting artifact-layer logic (`CrmView`, page config) in hand-written
code. Fix: the engine stays hand-written; every per-module artifact is generated.

## The pipeline (spec → generator → code)
| Spec (input) | Generator | Output (generated, do-not-edit) | Status |
|---|---|---|---|
| `spec/modules/<m>/schema.json` + `implementation/CANONICAL_DATA_MODEL.json` | `build_canonical_model.py` → migrations | `app/supabase/migrations/*.sql` | ✅ |
| `spec/modules/<m>/{schema,permissions,lifecycle}.json` | `gen_modules.py` | `server/modules/<m>/service.ts`, `app/api/staff/<m>/**` | ✅ |
| **`spec/screens/<m>.screen.json`** | **`gen_screens.py`** | `app/app/staff/<route>/page.tsx` | ✅ |
| generic (no screen spec) | `gen_ui.py` | basic table page | ✅ (fallback) |
| **`spec/effects/chains.json`** | **`gen_effects.py`** | `server/lib/transitionEffects.ts` (CHAIN post-conditions) | ✅ |
| **`workflows.json guards[]` + `spec/guards/guard_checks.json`** | **`gen_guards.py`** | `server/lib/transitionPreconditions.ts` (block a transition before it applies) | ✅ |
| **`spec/actions/<m>.actions.json`** | **`gen_actions.py`** | `server/crm/leadService.ts` + `app/api/staff/<base_route>/**` route glue | ✅ |
| **`spec/modules/<m>/workflows.json`** | **`gen_guards.py`** | `server/lib/transitionGuards.ts` (status→allowed-actions) | ✅ |

`gen_ui.py` now **skips any module that has a screen spec** — those are owned by
`gen_screens.py`. So a richer page = write `spec/screens/<m>.screen.json`, run
`python _validation/gen_screens.py`. No hand-edited pages, ever.

## What is now corrected
- **CRM page** is generated from `spec/screens/school_crm.screen.json` (was hand-written). `CrmView.tsx` deleted.
- The screen spec captures everything the page needs: columns, create fields,
  row-select (stage), custom actions (convert/lost/assign with confirm copy),
  detail panel (comms), import. The engine (`ModuleTable`) renders all of it.

## What is still hand-written (the roadmap to close)
These per-module artifacts are still hand-written and must come under generation next.
The spec INPUTS already largely exist in `spec/feature_effects/` (the FX/SCR/JRN/CHAIN pack):

**Nothing remains hand-written at the per-module artifact layer.** The onboarding
`activate` transition is now generated by `gen_modules.py` (STATUS_ACTION gained an
`activated` entry with a `reasonRequired:false` override) and its button by `gen_ui.py`;
its guard by `gen_guards.py` from `workflows.json`. The entire CRM module (page, service,
routes, effects, guards) is generated too. Every page/service/route/effect/guard now
comes from a spec via a generator.

DONE: `transitionEffects.ts` (gen_effects, CHAIN-002) and `server/crm/leadService.ts`
(gen_actions — list/create/stage/assign/lost/convert-CHAIN-001/interactions) are now
generated. CHAIN-001's full effect chain is spec-driven in the actions spec. Verified:
CHAIN-001 + CHAIN-002 journey e2e green against live Supabase.

## Change requests — how a change enters the system
Any change to behavior is a **change request**, not an ad-hoc code edit. Every module
already ships `feature_request_template.json` / `bug_fix_template.json` /
`change_control.json` — that is the CR home. The flow:
1. Write the CR in the module's folder: `spec/modules/<m>/feature_requests/FR-<MODULE>-<YEAR>-<NNNN>.json` (follow `feature_request_template.json`).
2. Apply the edit to the **target spec** (workflows / screens / actions / effects / schema / …).
3. Run the generator(s) listed in the CR.
4. Run the verify step (vitest + the JRN e2e), then `check_generated.py`.
Never hand-edit generated output to satisfy a change — change the spec, regenerate.
Example: `FR-SCHOOL-ONBOARDING-OPS-2026-0002` fixed the unreachable `under_review` so the
generated guard allows approve from `submitted`.

Until a generator exists for an artifact, any hand-written version is a TEMPORARY
stopgap and must be tracked here — not left silently bespoke.

## Guardrail (drift detection) — DONE
`_validation/check_generated.py` re-runs every generator and fails if any generated
file changed (someone hand-edited the output, or a spec changed without regenerating).
Run it on a clean tree; it's the CI gate that makes drift impossible to miss.

## The build loop, restated (spec-driven)
For each feature: (1) write/extend its specs — schema, **screen**, effects/chain,
guards; (2) run the generators; (3) the engine renders it; (4) write the JRN as a
Playwright e2e; (5) green only when the journey passes. Author **specs**, generate
**code** — never hand-write the per-module output.
