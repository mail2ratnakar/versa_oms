# Module Contract — the repeating unit

**Status:** foundation, founder-approved 2026-06-26. A module is the self-contained unit that makes the
system **modular, rollback-able, and safe to extend**: a feature is a new (or edited) module; its own gate
validates it; the global census (`check_handwritten_census.py`, P0.14) proves every *other* module is
byte-unchanged. This file freezes what artifacts every module must have.

## The unit

```
MODULE  <name>
├── specs (declarative — the source of truth)
│     schema.json            structure: primary table, fields, enums            (canonical-anchored)
│     permissions.json       RBAC policy (who may read/write/transition)
│     workflows.json         state machine + transition guards (lifecycle/precondition rules)
│     screens/*.screen.json  UI intent (optional; else gen_ui composes from the model)
│     rules.json             the module's business rules (8 types — spec/rules/RULE_TAXONOMY.md)
│
├── generated (derived — never hand-edited; GENERATED bucket)
│     server/modules/<name>/service.ts        CRUD + transitions
│     app/api/.../route.ts                    wiring (guard → validate(rules) → kernel → effects → envelope)
│     app/.../page.tsx                        the screen (composes the design system)
│     server/rules/<name>.generated.ts        compiled rule enforcement (gen_rules)
│     server/lib/transition{Guards,Effects,Preconditions}.ts  (shared, compiled from all modules)
│
├── kernel (irreducible — hand-written, founder-signed; FROZEN-KERNEL bucket)
│     server/<domain>/<name>.kernel.ts        ONLY the algorithms no rule can express
│                                             (e.g. OMR scoring, SHA-chain verify, ranking, dedupe math)
│
└── gates (validation — the module proves itself)
      global:      census · drift · design · a11y · scoping-isolation  (cross-module, already exist)
      per-module:  every declared rule is enforced · journey e2e (actor→action→API→DB→audit→effect→UI)
                   passes positive + a fail-closed negative · kernel type-checks
```

## Invariants

- **Every file in the unit is in exactly one P0.14 bucket** (GENERATED / FROZEN-KERNEL / ALLOWLISTED-DEBT).
- **The kernel holds only algorithms.** Judgment lives in `rules.json` (declarative); structure in the
  canonical model; wiring is generated. If something hand-written isn't an algorithm, it is debt to push up
  into a spec/rule.
- **Rollback = revert the module's specs/rules → regenerate.** Only that module's generated code changes; the
  census proves the rest is untouched.
- **A new feature = a new/edited module unit**, validated by its own per-module gate before merge.

## Build/verify order for a module (the master loop, per unit)

1. Edit the module's specs + `rules.json` (never the generated output).
2. Run the generators (`gen_*.py`, incl. `gen_rules.py`).
3. Diff-proof + **old-vs-new behavioral test** (a regenerated route must match the prior route exactly).
4. Per-module gate: every rule enforced · journey e2e (positive + fail-closed negative) · kernel types.
5. Global gates: census · drift · design · a11y · raw-CRUD.
6. Commit specs + generated output + kernel + tests together.
