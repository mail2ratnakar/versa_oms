# CLAUDE.md — READ THIS FIRST, EVERY TURN, BEFORE ANY ACTION

Project: **Versa OMS** (code in `versa-oms/`). This file is the operating contract. It is the ONE file loaded
automatically — the detailed docs below are NOT — so the non-negotiables live here. Do not skip it.

## THE FOUNDER'S NORTH STAR — read this so you understand WHY, not just what

The founder is building **centrally standardized, spec-driven, PRODUCTION-GRADE "vibe coding"**: the speed and
fluidity of conversational AI development WITHOUT the mess it usually leaves behind. That apparent contradiction
is resolved by ONE discipline — **intent → spec/rule → generate → gate → prove.** Same speed; zero debt.

- **Vibe** — the founder states intent conversationally; the system MATERIALIZES it: correct, complete, traceable.
- **Centrally standardized** — ONE definition per concern (a rule, a design token, a structure), applied
  everywhere by generators; never re-decided per file. One source of truth per fact (**DERIVE-DON'T-AUTHOR**).
- **Spec-driven** — the spec / rule / canonical model IS the truth; code is derived. Humans edit sources, never outputs.
- **Production-grade** — survives real users, bad input, retries, concurrency, security; wired end-to-end; gated.
  "Complete" = consequence · visibility · persistence · proof. Never a toy demo, never a half-build.

**What the founder needs from you:**
1. When they state intent, materialize it correctly + completely + **TRACEABLY** (every behaviour → a rule id they
   can name). Don't hand-write, don't duplicate a fact that already exists, don't half-build.
2. Make every standard a **GATE** — correctness guaranteed mechanically, not remembered. Invariants without gates rot.
3. Keep it **MODULAR** — a feature is a self-contained unit; it can't break others; rollback = revert its spec.
4. Be **HONEST** — never claim done without evidence; surface gaps; name what's pending. No over-claiming.
5. The founder should TRUST the pipeline and not have to babysit you to stop you producing the mess.

**The core lesson (earned the hard way):** your default instinct — produce plausible code by feel — IS the *bad*
vibe coding; it manufactures duplicate facts = drift = the mess. The *good* vibe coding is intent → spec/rule →
generate → gate → prove. **When you reach to type a fact, STOP and ask "where does this already live?" and derive
it.** That one habit is most of the job.

## 0. STOP. Before you write or change anything, read in this order:
1. **Brain** — `versa-oms/spec/brain/BRAIN_INDEX.md` (what "complete" means; when to stop and ask the founder)
2. **Skills** — `versa-oms/spec/skills/` (how to do the task)
3. **Master loop** — `versa-oms/spec/BUILD_PROCESS.md` (the ordered build process — FOLLOW it, don't improvise)
4. **Governance** — `versa-oms/spec/GENERATION_GOVERNANCE.md` + `spec/MODULE_CONTRACT.md` (the 7 layers + the module unit)
5. **Rules** — `versa-oms/spec/rules/RULE_TAXONOMY.md`
6. **Design** — `versa-oms/design-system/DESIGN_SYSTEM.md`
7. **The target module** — its `spec/modules/<m>/` + `versa-oms/implementation/CANONICAL_DATA_MODEL.json`

## 1. THE NON-NEGOTIABLES (these are why work has had to be redone — do not break them)
- **DERIVE, DON'T AUTHOR.** Every fact lives in exactly ONE place. If canonical / workflows / permissions / a
  spec already implies a fact, PROJECT it through a generator — NEVER re-type it. Before you type any value,
  ask "where does this already live?" and derive from there. Hand-typing a fact that already exists IS the bug.
- **NO HAND-WRITTEN code in the governed surface** (`app/`, `server/`, `migrations/`, `components/`). Every
  file is exactly one of: **GENERATED** (from a spec) · **FROZEN-KERNEL** (signed primitive) ·
  **ALLOWLISTED-DEBT** (signed, with a target batch). A new hand-written file FAILS `check_handwritten_census.py`.
- **Edit the SPEC/RULE, then regenerate.** Never hand-edit generated output (`// GENERATED … DO NOT EDIT`).
- **Kernel = ALGORITHMS ONLY** (math no rule can express: scoring, hashing, ranking, dedupe). Structure →
  canonical. Judgment → rules (declarative, compiled by `gen_rules.py`). Wiring → generated. Never put
  structure/judgment in the kernel, and never encode an algorithm as a spec string.
- **No spec relaxation** (P0.8) · **No hardcoding** (P0.9) · **Wire UI end-to-end** (P0.10) · **One workflow at
  a time** (P0.11) · **No raw-CRUD UI** (P0.12) · **Compose the design system** (P0.13) · **Generation
  governance** (P0.14). Full text: `versa-oms/spec/PRINCIPLES.md`.
- **When the founder states an invariant** ("never / always / no X"): DON'T fix the one file in front of you.
  Restate it as a rule → run a CENSUS of current violations across the repo → make it a GATE — BEFORE editing
  code. A principle in a doc rots; a gate sticks.

## 2. THE MOTION (every change goes one way)
`SPEC / RULE (the one source) → GENERATOR (gen_*.py) → generated wiring → calls KERNEL (algorithms) → GATES`.
A generated route = guard → validate(rules) → kernel → effects → envelope. You only ever edit **specs, rules,
or kernel** — never the generated output.

## 3. BEFORE YOU CLAIM DONE — run from the repo root; ALL must pass:
- `cd versa-oms/app && npx tsc --noEmit`
- `python _validation/check_handwritten_census.py`  (0 ungoverned)
- `python _validation/check_generated.py`  (no drift) · `python _validation/check_rules.py` · `python _validation/check_rule_provenance.py`  (every rule traces to a real source — no typed facts)
- `python _validation/check_no_raw_crud_ui.py` · `check_design_conformance.py` · `check_a11y.py` · `check_unique_constraints.py`  (all 0)
- the journey e2e (positive + a fail-closed negative). For a CONVERSION, prove **old-vs-new behaviourally
  identical** (capture OLD response → regenerate → capture NEW → diff) BEFORE making it permanent.
Then `versa-oms/spec/ARCH_RUNTIME_CHECKLIST.md` §16 Journey + §19 Pre-Commit Review. Commit spec + generated
output + kernel + tests together, naming the CR.

## 4. STYLE
Avoid permission prompts (Write tool for files, `git -C` not `cd`+git, single-line `python -c`, pipes not
`>file`). Don't lead with git/auditors. Stop and ask the founder before relaxing any constraint or on the
ARCH_RUNTIME_CHECKLIST §20 Stop Conditions.
