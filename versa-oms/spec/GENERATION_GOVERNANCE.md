# Generation Governance — the centralized spec-driven model

**Status:** founding decision 2026-06-26 (founder-approved). Defines how EVERY artifact in the repo is
governed so that *"centralized scoping is always followed"* is **structural, not remembered**.

## Why this exists (the recurring mess)

Spec-driven development kept eroding. We built **quality** gates — `check_no_raw_crud_ui`,
`check_design_conformance`, `check_a11y`, and `check_generated` (drift on a *hardcoded list* of known
generated paths) — but never a **completeness** gate. Nothing failed when a *new* hand-written file was
added outside the generators, so hand-written debt accumulated silently: **42 routes + 9 pages** discovered
hand-written on 2026-06-26, each having quietly re-implemented its own auth/scoping/validation.

**The lesson: invariants without gates rot.** Every founder principle that became an executable gate
(no-raw-CRUD P0.12, design P0.13, a11y) stuck at zero. Every one left as prose ("don't hand-write") decayed.
Governance has to be a **census that can't be bypassed**, not a rule I have to remember.

A second lesson, on communication: when the founder states an **invariant** ("no hand-written code"), the
right response is to (1) restate it as an enforceable rule, (2) run a **census of current violations**, and
(3) make it a gate — *before* touching code. Collapsing an invariant into "fix the one file in front of me"
is how it recurs.

## North star

The **spec is the single source of truth**. Every artifact — schema, RLS, routes, pages, services, effects,
guards, jobs, nav, lookups, validation — is **derived** by `gen_*.py`. A human edits specs, never outputs.
Only an irreducible, founder-signed **frozen kernel** is hand-written.

## The 7-layer architecture (foundation, founder-approved 2026-06-26)

```
1. BRAIN + SKILLS        how we build (mindset, master loop, "complete" = consequence·visibility·proof)
2. DOMAIN: BRD + CANONICAL MODEL   ground truth — business requirements + structure (tables/columns/enums)
3. RULES CATALOG         declarative business rules per module, 8 types          (spec/rules/RULE_TAXONOMY.md)
4. MODULE SPECS (JSON)   schema · permissions · workflows · screens · rules       (the module unit)
5. GENERATORS (py)       compile specs+rules+canonical -> wiring + enforcement    (incl. gen_rules.py)
6. KERNELS               GLOBAL runtime kernel (envelope/guards/defineModule) + PER-MODULE algorithm kernel
7. GATES                 GLOBAL (census/drift/design/a11y/scoping) + PER-MODULE (rules enforced·journey·types)
```

The **repeating unit is one module** (`spec/MODULE_CONTRACT.md`): its specs+rules generate its wiring; its
kernel holds only algorithms; its own gate validates it; the global census proves every *other* module is
byte-unchanged. That unit is what makes the system modular, rollback-able, and safe to extend.

**The rule engine is a build-time COMPILER, not a runtime interpreter** (`spec/rules/RULE_TAXONOMY.md`): rules
are authored centrally and *generated* into per-module enforcement. A central runtime engine would be a shared
god-object that breaks modularity / isolated rollback and would itself be a large hand-written primitive —
the opposite of the goal. Structure → canonical; **judgment → rules (declarative, generated)**; algorithms →
kernel (tiny, signed); wiring → generated. The kernel shrinks to *only* the math no rule can express.

## The three buckets

Every file in the governed surface (`app/`, `server/`, `supabase/migrations/`, `components/`) is **exactly
one** of:

1. **GENERATED** — emitted by a generator from a spec.
2. **FROZEN-KERNEL** — irreducible hand-written primitives, founder-signed, permanent. Includes the runtime
   kernel (`server/lib/*`, `server/guards/*`, `server/http/envelope`, `lib/supabase/admin`), the
   design-system components (`ModuleTable`, `design*`, `PortalShell`), `middleware.ts`/layouts/configs, AND
   the **domain algorithms** — OMR scoring, audit hash-chain verification, brute-force detection, lead
   dedupe — real logic that *cannot* be derived from a data model.
3. **ALLOWLISTED-DEBT** — temporary hand-written, each with a **reason + target conversion batch + founder
   sign-off**. Drains to empty over time.

`check_handwritten_census.py` **FAILS** on any governed file in none of the three (BUILD_PROCESS step 9).

## The wiring / primitive split

- **Generated layer = WIRING:** guard → validate → call a kernel primitive → envelope → audit.
- **Frozen kernel = PRIMITIVES:** envelope, guards, and the domain algorithms.

A generated route validates input, calls a kernel algorithm, envelopes the result, and audits. **We never
"generate" an algorithm** — encoding a SHA-chain verifier as a JSON spec just hides hand-written code inside
a spec string, which is the exact mess we are killing.

## Artifact inventory — what is governed by what

### A. Already centrally governed (spec → generator → output)

| Artifact | Source of truth | Generator |
|---|---|---|
| DB schema / DDL | `CANONICAL_DATA_MODEL.json` | DDL gen → `supabase/migrations/*.sql` |
| RLS policies | canonical | `gen_rls.py` |
| Module services + routes | `schema.json` + `permissions.json` + canonical | `gen_modules`, `gen_core` |
| Staff pages | screen specs | `gen_ui`, `gen_screens` |
| School services/routes/pages | school specs | `gen_school` |
| Action services | `spec/actions/*.json` | `gen_actions` |
| Transition guards + preconditions | `workflows.json` | `gen_guards` |
| Effect chains | `spec/effects/chains.json` | `gen_effects` |
| Job registry | `JOB_REGISTRY.json` + `QUEUE_CONFIG.json` | `gen_jobs` |
| Nav | modules | `gen_ui` → `navLinks.ts` |
| Lookups + school-scope maps | canonical / FKs | `gen_ui` → `*.generated.ts` |

### B. The gap — hand-written, to bring under governance

| Artifact | Count | Plan |
|---|---|---|
| Custom app routes | 30 | `gen_endpoints.py` (spec → full route). ALLOWLISTED-DEBT until converted, by batch. |
| Custom pages | 9 | generated shell / screen-spec composing design components. ALLOWLISTED-DEBT. |
| Inline Zod for custom endpoints | — | from canonical (as `gen_modules` does) |
| e2e tests | many | partly derivable from `WORKFLOW_REGISTRY.json` (later) |
| Infra routes (health/cron/webhook/internal) | 12 | FROZEN-KERNEL-class, founder-signed (kept hand-written by decision) |

### C. Frozen kernel — hand-written by design, founder-signed, permanent

`server/lib/*` (runtime kernel), `server/guards/*`, `server/http/envelope`, `lib/supabase/admin`,
design-system components, `middleware.ts`, layouts, configs, and the **domain algorithms** in `server/eval`,
`server/security`, `server/finance`, `server/files`, `server/results`, `server/roster`, `server/tasks`,
`server/certificates`, `server/audit`, `server/notifications`.

## Rules

- The **census gate** (`check_handwritten_census.py`) enforces the three buckets every run (BUILD_PROCESS
  step 9). It is a **completeness** gate, complementing the **quality** gates.
- Adding a FROZEN-KERNEL or ALLOWLISTED-DEBT entry requires **founder sign-off** in the allowlist, with a
  reason (and, for debt, a target batch).
- A new hand-written file with no entry **FAILS** the gate — convert it (spec + generator) or get it signed.
- Burn-down: each conversion batch generates files, removes their allowlist entries, and is gated by
  diff-proof + full e2e before commit (faithful copy = zero behavioral change by construction).
