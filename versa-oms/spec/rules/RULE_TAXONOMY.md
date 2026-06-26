# Rule Catalog & Taxonomy — the standardized business judgment layer

**Status:** foundation, founder-approved 2026-06-26. Defines layer 3 of the architecture (see
`spec/GENERATION_GOVERNANCE.md`): the declarative business rules that used to hide as hand-written judgment
in routes/kernel.

## The decision: the rule engine is a BUILD-TIME COMPILER, not a runtime interpreter

Rules are **authored centrally** (this catalog, one vocabulary, derived from the BRD + brain + canonical
model) and **compiled per module** into generated enforcement by `gen_rules.py`. There is **no runtime rule
engine** — a central runtime interpreter would be a shared god-object that breaks the very properties we want
(modularity, isolated rollback, "push a feature without breaking others") and would itself be a large
hand-written primitive. Instead: **central authoring, distributed (generated) enforcement.** Rules are data;
the engine is a generator; enforcement is generated, type-checked, drift-gated code.

Runtime-tunable *values* (e.g. an approval threshold an admin changes live) are NOT rules — they live in the
`admin_settings` module. Rule *structure* is generated at build time (a rule changing live = an untested rule
in production).

## Where rules derive from (provenance is mandatory)

Every rule carries a `source`. The hand-written judgment becomes traceable to its origin:
- `canonical:<table>.<column>` — structure-derived (e.g. a NOT-NULL column → a required-field validation).
- `BRD:<question/ref>` — a business requirement.
- `brain:<doc>` — a build-principle / quality-bar judgment.
- `workflow:<module>` / `effects:<chain>` / `permissions` — an existing rule-spec being consolidated here.

## The kernel shrinks to algorithms only

| Layer | Holds | Form |
|---|---|---|
| Canonical model + specs | structure (nouns) | declarative |
| **Rule catalog (this)** | **judgment (who/when/what's-required/eligible/happens)** | **declarative → generated** |
| Kernel | irreducible algorithms (SHA-chain, OMR scoring, ranking, dedupe similarity) | hand-written, signed, minimal |
| Generators | wiring that composes the above | code |

## The 8 rule types (one vocabulary, each compiles to a known target)

| `type` | Meaning | `when` | `then` | Compiles to |
|---|---|---|---|---|
| `validation` | input shape / required / range / format | field + condition | field error | a `validate<Module>_<action>(body)` checker |
| `scoping` | which rows an actor may see/act on | actor dimension | row filter | query filter + RLS policy |
| `precondition` | when an action is allowed (state + data) | guard condition | block + reason | transition guard |
| `eligibility` | entity qualifies for an outcome | entity condition | allow/deny | generated eligibility check |
| `approval` | high-risk action needs N distinct approvers | action | require approvals, no self-approve | dualApproval |
| `effect` | what happens after a transition (cross-module) | trigger transition | consequence actions | effect chain |
| `masking` | which fields hidden/masked for which role | role + field | mask/hide | field masking |
| `lifecycle` | legal state transitions | from-state + action | to-state | state machine |

`effect`, `precondition`/`lifecycle`, `approval` and `permissions` already exist as fragmented rule-specs
(`effects/chains.json`, `workflows.json`, `permissions.json`); this taxonomy **consolidates and completes**
them — it does not reinvent them. New coverage this layer adds: `validation`, `scoping`, `eligibility`,
`masking` as first-class declared rules.

## Status & coverage (DESIGN founder-approved 2026-06-26; implementation PHASED — do not over-claim)

The taxonomy, the 7-layer skeleton and the per-module unit are **approved**. Implementation is phased; this
table is the honest state so "approved" is never mistaken for "all enforced":

| type | derived into catalog | enforcement compiled | by |
|---|---|---|---|
| validation | yes (~400) | **yes — FROM the catalog** | `gen_rules` (+ founder judgment for server-set) |
| effect | yes (3) | **yes — FROM the catalog** | `gen_effects` (reads the catalog; byte-identical) |
| lifecycle | yes (573) | **yes — the state machine FROM the catalog** | `gen_guards` (`transitionGuards.ts` byte-identical; legal-states rules added). Preconditions still from source. |
| precondition | yes (817) | **yes — FROM the catalog** | `gen_guards` (`transitionPreconditions.ts` byte-identical; guards + `to` from the catalog) |
| masking | yes (~400) | yes, from SOURCE | masking kernel (canonical) |
| approval | yes (10, from HRA) | **yes — FROM the catalog** | `gen_modules` reads `DUAL_MODULES` from the catalog (services `dualApproval` byte-identical); was a wrong workflow heuristic, now HRA-accurate |
| scoping | yes (46) | **yes — the school-scope map FROM the catalog** | `gen_school_scope` (byte-identical + cross-school no-leak verified). RLS deny-by-default (`gen_rls`) + scope guards remain kernel. |
| eligibility | **no (0)** | **no** | authored judgment — not yet built |

So today the catalog is a **unified, traceable VIEW** of rules whose enforcement (except validation) is still
compiled by the existing generators from their source specs. **Unifying all 8 types' compilation through the
catalog**, **`eligibility`**, the **per-module kernel split** and **per-module gates** are the remaining
foundation work.

**TRACEABILITY (founder requirement — "which rule is it?"):** every rule has a UNIQUE id, enforced by
`check_rules.py`. Validation/masking/scoping ids are entity-scoped (`<entity>.<action>.<name>`); lifecycle/
precondition/approval are workflow-scoped (`<module>.<workflow>.<action>.<name>`) so the same transition in two
modules (the two-spec-track) stays two distinct, addressable rules. 2163 rules, 0 duplicate ids.

## The rule object (schema: `spec/rules/rule.schema.json`)

```json
{
  "id": "support_tickets.create.subject_required",
  "module": "support_tickets",
  "action": "create",
  "type": "validation",
  "when": { "field": "subject", "condition": "required_nonempty" },
  "then": { "error": { "field": "subject", "code": "VALIDATION_FAILED", "message": "A subject is required." } },
  "source": "canonical:support_tickets.subject (NOT NULL) + BRD:WF-010",
  "severity": "error",
  "enabled": true
}
```

A module's rules live in `spec/rules/<module>.rules.json` (`{ "_meta": {...}, "rules": [ ... ] }`).
`gen_rules.py` compiles them into `app/server/rules/<module>.generated.ts` (GENERATED bucket, P0.14), which
the generated wiring (and, during burn-down, the still-hand-written routes) call. Per-module gates assert
every declared rule is enforced.
