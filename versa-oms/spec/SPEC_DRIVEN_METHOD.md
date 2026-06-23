# Spec-Driven Method — the rule, the layers, the pipeline

This is the contract for how Versa OMS is built. It exists because we drifted:
when the generic generators produced thin output, we hand-coded the richness
(a bespoke `CrmView`, hand-written page config) instead of enriching the **spec**
and the **generator**. That is the anti-pattern. This document prevents it.

## The one rule
**Never hand-edit a per-module artifact. Change the spec, then regenerate.**
Generated files carry a header: `// GENERATED … DO NOT EDIT`. If you need different
behavior, edit the spec and re-run its generator — never the output.

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
| **`spec/actions/<m>.actions.json`** | **`gen_actions.py`** | `server/crm/leadService.ts` (list/create/field-actions/convert-CHAIN/sub-collection) | ✅ |

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

| Hand-written today | Spec input that should drive it | Generator to build |
|---|---|---|
| CRM thin route glue (`app/api/staff/schools/crm/[id]/*`) | `spec/actions/school_crm.actions.json` | extend `gen_actions.py` to emit routes |
| `transitionGuards.ts` DATA (the status→actions map) | module `lifecycle_states.json` + a transitions edge list | `gen_guards.py` |
| onboarding `activate` transition (hand-added to service) | module workflow/lifecycle spec (add the edge) | re-run `gen_modules.py` |

DONE: `transitionEffects.ts` (gen_effects, CHAIN-002) and `server/crm/leadService.ts`
(gen_actions — list/create/stage/assign/lost/convert-CHAIN-001/interactions) are now
generated. CHAIN-001's full effect chain is spec-driven in the actions spec. Verified:
CHAIN-001 + CHAIN-002 journey e2e green against live Supabase.

## Change requests — how a change enters the system
Any change to behavior is a **change request**, not an ad-hoc code edit. The flow:
1. Capture intent as `spec/change_requests/<id>.change.json` (what & why, target spec, edits, regen + verify steps).
2. Apply the edit to the **target spec** (screen / actions / effects / schema / …).
3. Run the generator(s) listed in the CR.
4. Run the verify step (vitest + the JRN e2e).
Never hand-edit generated output to satisfy a change — change the spec, regenerate.

Until a generator exists for an artifact, any hand-written version is a TEMPORARY
stopgap and must be tracked here — not left silently bespoke.

## Guardrail (drift detection)
Generated files have the `DO NOT EDIT` header. A `check_generated.py` (CI) should
regenerate into a temp dir and diff against the tree; any difference = someone
hand-edited a generated file (or forgot to regenerate) → fail. Add this before
relying on the generators at scale.

## The build loop, restated (spec-driven)
For each feature: (1) write/extend its specs — schema, **screen**, effects/chain,
guards; (2) run the generators; (3) the engine renders it; (4) write the JRN as a
Playwright e2e; (5) green only when the journey passes. Author **specs**, generate
**code** — never hand-write the per-module output.
