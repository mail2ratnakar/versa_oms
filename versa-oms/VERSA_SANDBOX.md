# Versa Sandbox — the deterministic vibe-coding framework

**One source of truth + Python derivers + executable gates build a production-grade app from conversational intent — with full traceability.** The **annotation layer** (draw intent on the live app → it folds into the source) is the product surface. Backed by deep research in [`research/versa_sandbox_research.md`](../research/versa_sandbox_research.md).

## The thesis (research-validated)
The 2025 industry independently converged on Versa's exact loop — **`intent → spec → generate → gate → prove`** — but **no shipping tool closes it.** v0 / Bolt / Lovable / Cursor / Kiro / Tessl all generate from a non-deterministic LLM with **no source-of-truth system of record, no requirement→code trace, and no _enforced_ gate** (their rules files are advisory context the model can ignore). The differentiators, all proven by the failures of others:

1. **The gate — not the generator — guarantees correctness.** LLMs aren't deterministic even at temp 0 (≈80 unique completions per 1,000 calls; 75.76% of tasks vary). So the gate is the spec; the generator is replaceable.
2. **The visual layer feeds the source, never the generator.** Every tool that lets a visual edit route through AI regeneration hits the same wall — the model overwrites human/working lines because it can't tell them apart. Versa's non-negotiables #8/#9 are the research-backed fix.
3. **The deterministic blueprint already exists pre-LLM** — OpenAPI / Prisma / protobuf / Django all derive many artifacts from one source via: pure-function generators · pinned versions · idempotent diff-based regen · DO-NOT-EDIT headers · signed exceptions · **a drift gate**. _"The gate is what makes it real; a projection pipeline without a drift gate rots."_

## The 5 Ws + H framework (Zachman + EARS, mapped to Versa)
Each interrogative owns its facts (one-fact-one-place); each has a SOURCE that captures it and a GATE that enforces it. EARS (`While <pre>, When <trigger>, the system shall <response>`) is the bridge from a requirement to an executable acceptance test.

| | Specifies | SOURCE artifact | GATE |
|---|---|---|---|
| **WHO** | actors, roles, RBAC, access matrix, ownership, data-classification | access-matrix + security params | `check_access` — every action traces to a role; RLS exists **and works** |
| **WHAT** | entities, identity keys, FKs, fields, scope | canonical data model (15th param) | `check_canonical` — keyed, real FKs, connected, no off-spec/dead tables |
| **WHERE** | modules, screens, field placement, nav, environments | screen-composition spec (fields/bindings/actions declared in source) | `check_design` + screen-contract — every field traces to canonical; no raw-CRUD |
| **WHEN** | lifecycle states, triggers, events, schedules | lifecycle param + effect-chain spec | `check_chain` — every state reachable/exited; every effect consumed |
| **WHY** | goals, business rules, acceptance criteria, change-control | rule catalog + change-control param (each rule carries its trace-id) | `check_catalog` + journey gate — every requirement has a test (positive + fail-closed negative) |
| **HOW** | workflows, APIs, services, effect chains | API-contract + effect-chain specs → `gen_routes`/`gen_services`/`gen_rules` | `check_generated` + `check_census` — every governed file is derived; none hand-written |

---

## The annotation → source interpretation ladder (the running list)
The annotate layer captures typed intent; each type is _interpreted_ into a source change. **Deterministic** steps auto-apply to the derived layer; **interpretive** steps emit a reviewed suggestion (the source spec is never auto-mutated).

### ✅ COMPLETED
| # | Step | Type | Mode | Where |
|---|---|---|---|---|
| 1 | annotation → source artifact (importer + 2 buttons) | all | deterministic | `/api/annotate/import` → `annotated_flows.json` |
| 2 | selector → **field binding** (renders as field help) | data/note | deterministic | `derive_annotations` `.bind` → `gen_portal` |
| 3 | selector → **action binding** | action | deterministic | `derive_annotations` resolve → action key |
| 4 | `type=note` → field/screen documentation | note | deterministic | field help + screen Flow-notes block |
| 5 | `type=validation` → **suggested `send_validation`** | validation | interpretive (suggested) | `FLOW_INTENT.md` paste-ready block |
| 6 | `type=data` (prefill) → **suggested compose `prefill`** | data | interpretive (suggested) | `FLOW_INTENT.md` paste-ready block |

### ⏳ PENDING (interpretive steps remaining)
| # | Step | Type | Output |
|---|---|---|---|
| 7 | `type=action` → suggested **send action / lifecycle transition** | action | suggested `send[]` / lifecycle entry |
| 8 | `type=screen` → suggested **tab / journey screen** | screen | suggested `tabs[]` / nav entry |
| 9 | `type=trigger` → suggested **entry point** (bulk_action / nav / button) | trigger | suggested `bulk_action` / nav |
| 10 | flow **step order** → suggested **journey sequence / stepper** | (order) | suggested journey step order |
| 11 | "add X" intent → suggested **new compose field** (canonical-checked) | data | suggested field + canonical impact |
| 12 | unresolved selector → **disambiguation prompt** (offer the N candidate fields) | any | reviewer picks the binding |

**Remaining interpretive steps: 6** (#7–#12). Each ships as a reviewed suggestion in `FLOW_INTENT.md` first; promotion to auto-write-into-source is a per-step opt-in (you chose derived-only as the default).

---

## Feature roadmap (28 researched features → Versa status)
**HAVE ✅ · PARTIAL ◐ · NEED ○**

**Intent capture** — ✅ live-screen annotation · ✅ annotation→source compiler · ✅ pickers bound to canonical · ◐ 5W1H interrogation engine (questionnaire exists, not 5W1H-structured) · ○ EARS-constrained requirement entry · ○ conversational intent w/ explicit assumption surfacing
**Source modeling** — ✅ keyed canonical · ✅ 15-param module contract · ✅ one-fact-one-place · ✅ source-declared screen composition · ✅ signed exception registry (frozen-kernel/debt)
**Derivation** — ✅ per-concern generators · ◐ pure-function generators · ○ **pinned generator/template versions** · ✅ idempotent diff-based regen · ◐ DO-NOT-EDIT headers · n/a deterministic LLM serving (no LLM in the pipeline) · ○ **golden-output snapshot tests**
**Gates** — ✅ `check_canonical` · ✅ `check_chain` · ◐ `check_access` (auth-last) · ✅ `check_design`/no-raw-CRUD · ✅ `check_census` · ✅ journey gate (positive + fail-closed) · ◐ questions⇄gates duality audit (principle; needs a meta-gate)
**Traceability** — ○ **bidirectional trace graph** (req ↔ source ↔ file ↔ test) · ◐ annotation provenance ledger (`saved_at` exists; needs edit→regen→gate chain)
**Collaboration** — ◐ spec-diff review (git diff today; needs source-diff + generated-diff + gate-result PR view)
**Determinism guarantees** — ○ **reproducibility receipt** (source hash + generator versions + gate results manifest)

**Highest-leverage NEEDs** (close the last determinism gaps): pinned generator versions · golden-output snapshot tests · bidirectional trace graph · reproducibility receipt · `check_access` (with auth) · the questions⇄gates meta-gate.

## Top determinism gaps Versa closes (vs the field)
1. No source-of-truth system of record → **keyed source is the only authored truth; code is a projection.**
2. Rules advisory, not enforced → **gates are executable, not prompts.**
3. No requirement→code trace → **trace graph + provenance ledger.**
4. Regeneration overwrites human code → **DO-NOT-EDIT surface + signed exceptions; humans edit only source.**
5. Non-determinism at temp 0 → **deterministic generators are the spine; the LLM is gated regardless.**
6. No drift gate → **`check_canonical`/`check_chain`/census at the front.**
7. Security un-gated → **`check_access` proves policies _work_** (the Lovable CVE class).
8. Data-model integrity unenforced → **keyed canonical + end-to-end chains reject orphans/dead tables.**
9. Acceptance is a claim, not a test → **every requirement carries a journey test.**
10. Visual layer is a parallel write path → **annotation is INTENT that folds into source (#8/#9).**

_Full landscape, citations, and the 28-feature detail: [`research/versa_sandbox_research.md`](../research/versa_sandbox_research.md)._
