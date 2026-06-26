# CLAUDE.md — READ THIS FIRST, EVERY TURN, BEFORE ANY ACTION

Project: **Versa OMS** (code in `versa-oms/`). This file is the operating contract. It is the ONE file loaded
automatically — the detailed docs below are NOT — so the non-negotiables live here. Do not skip it.

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
