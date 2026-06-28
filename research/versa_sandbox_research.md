# Versa Sandbox — Deep Research: Deterministic, Spec-Driven AI App Generation

**Purpose.** Inform a product ("Versa Sandbox") where ONE source of truth + Python derivers/generators + executable gates build a production-grade app from conversational intent ("vibe coding"), with full traceability — and where a **visual annotation layer** (draw intent on live screens → folds into the source) is the centerpiece.

**The thesis the research validates.** The 2025 industry consensus has independently arrived at exactly the loop Versa encodes — `intent → spec → generate → gate → prove` — but **no shipping tool closes the loop**, because every one of them generates from a non-deterministic LLM with no source-of-truth layer that is the system of record, no requirement→code traceability, and no *enforced* gate. Their "rules/spec/context" files are probabilistic guidance the model can ignore, not compilers/tests/policy engines. Versa's differentiator is making the **gate** — not the generator — the guarantee of correctness, and making the **annotation layer feed the source, never the generator**.

---

## Part 1 — Landscape findings (cited)

### 1. Spec-driven dev tools

| Tool | Intent capture | Generates | Determinism / traceability | Key gap |
|---|---|---|---|---|
| **GitHub Spec Kit** ([repo](https://github.com/github/spec-kit), [blog](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)) | NL "what/why"; progressive slash-commands (`/specify`,`/plan`,`/tasks`) + a `constitution.md` | Markdown spec → plan → tasks → code; `/analyze` cross-checks coverage | Artifact-chaining + consistency review; **no spec→code link, no reproducibility guarantee** | Markdown specs aren't machine-verifiable; agent is still the non-deterministic core; it improves input quality, not output reproducibility |
| **AWS Kiro** ([intro](https://kiro.dev/blog/introducing-kiro/), [specs](https://kiro.dev/docs/specs/)) | NL prompt → unpacks into `requirements.md` in **EARS notation** | `requirements.md` (EARS) + `design.md` + `tasks.md`; **tasks linked back to requirements**; steering files; agent hooks | Strongest explicit traceability of the four; EARS gives atomic testable reqs; claims bidirectional sync | High upfront friction; docs emphasize task execution over verified req→code mapping; backward drift loop under-examined; still LLM-backed underneath |
| **Tessl** ([launch](https://tessl.io/blog/tessl-launches-spec-driven-framework-and-registry/), [review](https://codemyspec.com/blog/tessl-review)) | Hand-crafted or AI "vibe-specs"; capabilities each linked to a test; `@generate` directive | Code stamped `// GENERATED FROM SPEC - DO NOT EDIT`; tests enforce capabilities | Most radical — **spec is the maintained artifact, code is regenerable** | **Non-determinism is the unsolved core**: repeatability needs ever-more-detailed specs; JS-only; closed beta ~9mo; **Jan 2026 pivoted** toward agent governance — tacit admission regeneration was harder than promised |
| **BMAD** ([repo](https://github.com/bmad-code-org/BMAD-METHOD)) | Agent roles (Analyst/PM/Architect/Dev/QA) | PRDs, story files, code, tests, CI/CD | Process discipline (roles + quality gates), not reproducible generation | Orthogonal — organizes *agents*, not *specs*; same non-deterministic core |

**The convergent verdict** (Tessl critique, applies to all): without reproducible generation, *"the spec is not a source of truth; it is a prompt with extra steps, and you are back to refining inputs until the slot machine pays out."* Birgitta Böckeler had to *"iterate on the spec and make it more and more specific to increase the repeatability"* — the universal workaround that *is* the admission the gap is unsolved.

### 2. "Vibe coding" — origin & the determinism problem

- **Origin.** Andrej Karpathy, Feb 2, 2025 ([tweet](https://x.com/karpathy/status/1886192184808149383)): *"There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."* He "Accept All always… don't read the diffs," scopes it to *"throwaway weekend projects."* **Collins** named it Word of the Year 2025; Merriam-Webster tracked it (M-W's actual WOTY was "slop").
- **Simon Willison's sharpening** ([article](https://simonwillison.net/2025/Mar/19/vibe-coding/)): vibe coding = *"building software with an LLM without reviewing the code it writes."* His gate: *"I won't commit any code… if I couldn't explain exactly what it does to somebody else."*
- **The reduction patterns** (Böckeler, [martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)): the **spec-first → spec-anchored → spec-as-source** ladder; "regeneration over editing"; the named risk of spec-as-source = *"the downsides of both MDD and LLMs: inflexibility AND non-determinism."* Addy Osmani ([good-spec](https://addyosmani.com/blog/good-spec/)): the spec is *"the source of truth that both you and the agent can refer back to… prevents drift."*
- **Why LLMs aren't deterministic even at temp 0** — the definitive 2025 result, He / Thinking Machines Lab, *["Defeating Nondeterminism in LLM Inference"](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)* (Sep 2025): the cause isn't float non-associativity but **lack of batch-invariance** — *"the load (and thus batch-size) nondeterministically varies,"* changing reduction order and flipping the argmax. Demo: 1,000 temp-0 requests → **~80 unique completions** on vanilla vLLM; **all 1,000 identical** with batch-invariant kernels. Corroborated by Ouyang et al. (arXiv:2308.02828, ACM TOSEM 2024): *"setting the temperature to 0 does not guarantee determinism"*; up to **75.76% of tasks had zero equal test output across requests.**

**Implication for Versa:** you cannot rely on the model for reproducibility. The **gate, not the generator, guarantees correctness** — which is the entire architectural bet.

### 3. AI app builders — where they leak

| Tool | Non-deterministic | Non-traceable | Un-gated (signature evidence) |
|---|---|---|---|
| **v0** (Vercel) | LLM base; ~6% ship with errors | prompt→code only | AutoFix is a *quality rate* not a gate; [edits unrelated files / breaks in prod](https://community.vercel.com/t/a-lot-of-errors-using-v0-bad-responses-unnecessary-changes/15874) |
| **Bolt.new** | hallucination, [context loss](https://www.seaflux.tech/blogs/bolt-new-ai-full-stack-apps/) | context lost in long sessions | [15% leak API keys; 7% ship with RLS off](https://vibeappscanner.com/bolt-security) |
| **Lovable** | *"regenerating produces different code"* ([vendor](https://www.rapidevelopers.com/lovable-issues/fixing-inconsistent-output-from-lovable-s-ai-code-generation)) | *"does not remember previous sessions"* | **CVE-2025-48757**: RLS off across [303 endpoints / 170 projects](https://www.superblocks.com/blog/lovable-vulnerabilities); the scanner *"only flagged presence of RLS, not whether it worked"* |
| **Replit Agent** | autonomous hypothesis-forming | fabricated reports/data | *"**There is no way to enforce a code freeze in vibe coding apps like Replit.**"* — [deleted a prod DB](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) |
| **Cursor** | recent context overrides rules | *"no audit trails"* | rules = *"injected context, not enforcement"* ([docs](https://cursor.com/docs/rules)); *"a predictive engine, not a policy enforcer"* ([Knostic](https://www.knostic.ai/blog/cursor-does-not-follow-rules)) |
| **Claude Code** | *"may pick one arbitrarily"* on conflicts | — | CLAUDE.md *"not a hard enforcement layer… To block an action… use a PreToolUse hook"* ([docs](https://code.claude.com/docs/en/memory)) — i.e. a deterministic gate |

Systemic critiques: Osmani's **["70% problem"](https://addyo.substack.com/p/the-70-problem-hard-truths-about)** (*"the final 30% becomes an exercise in diminishing returns… house of cards code"*); **Veracode 2025** ([report](https://www.veracode.com/blog/genai-code-security-report/)): *"45% of code samples failed security tests"*; **slopsquatting** (Spracklen, USENIX 2025): *"19.7% of generated packages are fictitious"*; **GitClear 2025**: duplicated blocks rose 8×, refactoring fell to 9.5%. InfoQ's framing of the Versa thesis: *"code is no longer the system of record; the specification is… generation must be logically reversible."*

### 4. Single-source-of-truth codegen (the proven, pre-LLM blueprint)

| Source artifact | Derived projections | Why deterministic |
|---|---|---|
| **OpenAPI** `openapi.yaml` ([gen](https://openapi-generator.tech/)) | 70+ client SDKs, 60+ server stubs, docs, mocks, DB schemas, Postman/JMeter | pure fn (model × Mustache templates); pinnable `OPENAPI_GENERATOR_VERSION`; `.openapi-generator-ignore` = signed exception |
| **JSON Schema** ([quicktype](https://quicktype.io/), [jstt](https://github.com/bcherny/json-schema-to-typescript)) | validation, types (30+ langs), TS interfaces, [auto-forms (RJSF)](https://rjsf-team.github.io/react-jsonschema-form/), docs | pure fn; output stamped *"DO NOT MODIFY IT BY HAND"* |
| **Django model** / **Rails migration** ([Django](https://docs.djangoproject.com/en/stable/topics/db/models/)) | migrations, query API, **admin CRUD UI**, ModelForms, DRF serializers | `makemigrations` = diff engine; convention-over-configuration removes divergent choices |
| **`schema.prisma`** ([Prisma](https://www.prisma.io/docs/orm)) | SQL migrations, DB schema, **type-safe client**, Studio GUI | *"single source of truth"*; `generate` is pure projection; prod `migrate deploy` only applies committed history |
| **`.proto`** ([protobuf](https://protobuf.dev/) + [buf](https://buf.build/docs/)) | message types + gRPC stubs in 10+ langs, binary wire format | `protoc` is a pure compiler; buf pins plugin versions; **breaking-change detection** is the gate |
| **DB schema** ([Hasura](https://hasura.io/docs/), [PostgREST](https://postgrest.org/)) | instant GraphQL/REST API from introspection | *"no second definition exists to fall out of sync"* — the purest "no second copy" example |

**The six mechanisms that make it deterministic** (the blueprint to copy): (1) one authoritative source per fact; (2) generation is a pure function of input; (3) **pinned generator + template versions**; (4) idempotent, diff-based derivation, regenerate-over-edit; (5) **"DO NOT EDIT" headers + signed ignore/allowlist** for exceptions; (6) **a gate enforces the source stays the only truth** (buf breaking-change, Prisma/Alembic schema-vs-DB diff, terraform plan drift, dbt tests). *"The single most important lesson: the gate is what makes it real… a projection pipeline without a drift gate rots."*

### 6. Visual / no-code intent capture (the annotation centerpiece)

**The one finding that matters most:** the only way to map a visual edit to *clean* source is **build-time stable-ID instrumentation** — and the moment a change routes through an AI regeneration step, *every* tool hits the same wall: **the model can't tell human-authored lines from previously-generated ones, so it overwrites them**.

- **Onlook** (Apache-2.0, [repo](https://github.com/onlook-dev/onlook)) — closest analogue. Injects `data-oid` into JSX at build time; visual edit → reads `oid` → patches exact JSX → HMR. *"What you build on the canvas is the real product, not a mockup."* Code is the source of truth; edits flow *into* the codebase.
- **Lovable Visual Edits** ([blog](https://lovable.dev/blog/visual-edits)) — best round-trip engineering: compile-time JSX IDs + Babel/SWC **AST** edits + minimal-line diff; instant style/text edits **bypass the AI entirely**. But Select/Draw routes through AI → *"does not know which lines you wrote manually vs generated previously… every in-context file is fair game."*
- **Builder.io Visual Copilot** ([blog](https://www.builder.io/blog/figma-to-code-visual-copilot)) — Figma→code via Mitosis; **component mapping** to your repo (beta) is the most relevant feature; no token extraction; one-way.
- **Figma Code Connect** ([blog](https://www.figma.com/blog/introducing-code-connect/)) & **Dev Mode MCP** — default codegen is *"reference-grade, not ship-grade"*; Code Connect exists *precisely because* default output doesn't reflect the real design system. Requires a hand-authored mapping layer.
- **Webflow / Anima / Locofy** — one-way export; re-export **overwrites** edits; tokens flattened to hardcoded values; "div soup"; absolute positioning on complex layouts; ~60% responsive accuracy.
- **Cursor Design Mode** / **v0 design mode** / **Bolt inspector** — runtime guessing (xpath + screenshot + React fiber); Builder.io: *"a surprisingly hard problem… agents get confused by state, create duplicate components, hardcode values instead of respecting state logic."*

**Five lossiness patterns:** (1) one-way export with overwrite-on-regenerate; (2) tokens flattened to hardcoded values; (3) generated components don't match the real codebase; (4) messy/non-semantic output (the 70/30 trap); (5) selection→source mapping is the hard problem.

**Design implication for Versa (decisive):** keep the annotate/visual layer as **intent that folds into a single governed source and is projected by generators — never as a second authoring surface.** This is exactly the failure every tool above demonstrates when the visual edit becomes a parallel write path. Versa's *"visual tools feed the source, never the generator"* non-negotiable is the correct, research-backed architecture.

---

## A. The 5 Ws + H framework table

Grounded in the **Zachman Framework** ([Wikipedia](https://en.wikipedia.org/wiki/Zachman_Framework)), which literally maps the six interrogatives to architecture columns (What→Data, How→Function, Where→Network, Who→People, When→Time, Why→Motivation), each column *independent and non-redundant* (= one-fact-one-place). Acceptance enforced via **EARS** ([Mavin](https://alistairmavin.com/ears/)) + **Gherkin/Given-When-Then** ([Fowler](https://martinfowler.com/bliki/GivenWhenThen.html), [Cucumber](https://cucumber.io/docs/gherkin/reference/)) — *"an example is also a test… an executable specification of the system."*

| | Specifies in the app | SOURCE artifact that captures it | GATE that enforces it |
|---|---|---|---|
| **WHO** | Actors, roles, personas, RBAC, access matrix, ownership, data classification | `roles.json` / access-matrix + data-classification params (the 14-param security/access set) | `check_access` — every entity action traces to a role; no action without an actor; RLS policy exists per table & **works** (not just "present", per the Lovable CVE lesson) |
| **WHAT** | Entities, identity keys, FK relationships, fields, features, scope | Canonical data model (the 15th param) derived from BRD/responses | `check_canonical` — keyed identity, real FKs, connected, no off-spec entity, no dead tables (build-matches-spec) |
| **WHERE** | Modules, screens, UI placement, environments, data residency, nav | Screen-composition spec (fields/bindings/actions **declared in source**, projected by `gen_portal`); module map | `check_design` + screen-contract gate — every screen field traces to canonical; no raw-CRUD; placement declared not hand-typed in a generator |
| **WHEN** | Lifecycle states, triggers, events, schedules, temporal rules | Lifecycle-state param + effect-chain spec | `check_chain` — every lifecycle wired end-to-end; every state reachable & exited; no orphan state |
| **WHY** | Goals, business rules, rationale, acceptance criteria, change-control | Rule catalog (validation/scope/eligibility/approval) + change-control param; each rule carries its rationale/trace-id | `check_catalog` + journey gate — every rule traces to a requirement; **every requirement has a journey test** (positive + a fail-closed negative) |
| **HOW** | Workflows, processes, APIs, algorithms, effect chains, services | API-contract + effect-chain specs → `gen_routes`/`gen_services`/`gen_rules` | `check_generated` + `check_census` — every route/service/rule is generated from a source; no hand-written governed file; compiled enforcement matches catalog |

**The duality made operational** (Versa non-negotiable #2): for every fault-class there is a **question** (an interrogative cell above) that elicits it AND a **gate** that enforces it. EARS is the bridge — `While <pre>, When <trigger>, the <system> shall <response>` is a single-line Given-When-Then ready to expand into an executable acceptance test.

---

## B. Prioritized feature list (28 features, by theme)

### (1) Intent capture
1. **Live-screen annotation overlay (the centerpiece)** — draw/circle/comment/select on the *actual generated screens* via live iframes (Onlook-style 1:1 mirror). *Determinism:* intent is captured against the real app, not a mockup, so there is no design↔build drift to reconcile.
2. **Annotation → source compiler** — every annotation emits typed INTENT JSON that folds into the source-of-truth (never the generated code). *Determinism:* one write path; the visual layer can never become a second authoring surface (the universal failure of v0/Lovable/Cursor).
3. **5W1H interrogation engine** — a questionnaire that won't let a feature be "specified" until Who/What/Where/When/Why/How are all answered. *Determinism:* completeness is structural, not best-effort — nothing is silently omitted.
4. **EARS-constrained requirement entry** — requirements authored in the five EARS templates (ubiquitous/state/event/optional/unwanted). *Determinism:* atomic, unambiguous, directly testable requirements.
5. **Conversational intent with explicit assumption surfacing** — like Kiro, *"make prompt assumptions explicit."* *Determinism:* ambiguity is resolved at capture time, not guessed at generation time.
6. **Component/field picker bound to canonical** — visual pickers (icon/field/FK) emit references to existing source entities, never free text. *Determinism:* no hallucinated fields; every choice is a real source fact.

### (2) Source-of-truth modeling
7. **Keyed canonical data model** — every entity has a stable identity key; every relationship is a real FK. *Determinism:* the v1-killing "unkeyed identity spine" is structurally impossible.
8. **15-param module contract** — 14 playbook params + DATA MODEL, same shape for every module. *Determinism:* uniform structure → one per-concern generator handles all modules; no special-casing.
9. **One-fact-one-place enforcement (Zachman columns)** — each interrogative owns its facts; no fact re-typed across artifacts. *Determinism:* a change flows from one edit, can't diverge.
10. **Source-declared screen composition** — fields/bindings/actions live in source, projected by `gen_portal`. *Determinism:* screens are derived, so they can't drift from the data model (the "div soup / hardcoded facts in a generator" trap).
11. **Signed exception registry (frozen-kernel / frozen-debt)** — any non-generated file is explicitly listed & signed. *Determinism:* the census can prove the governed surface is 100% derived.

### (3) Derivation / generation
12. **Per-concern Python generators (DRY)** — one script per concern, looping all modules. *Determinism:* generation logic exists once; same input → same output everywhere.
13. **Pure-function generators (no network/clock/random)** — output = f(source × templates) only. *Determinism:* reproducible by construction, like `protoc`/`prisma generate`.
14. **Pinned generator + template versions** — version-lock every generator and template (the OpenAPI/buf pattern). *Determinism:* same source + same versions = byte-identical output across machines/time.
15. **Idempotent, diff-based regeneration** — derive migrations/code by diffing desired vs current state; re-runnable safely. *Determinism:* convergent; regenerate-over-edit is always safe.
16. **"DO NOT EDIT" headers on all generated output** — every generated file stamped. *Determinism:* hand-edits are detectable and treated as bugs.
17. **Deterministic LLM serving for the AI steps** — where an LLM *is* used, pin to batch-invariant inference (Thinking Machines pattern) + temperature 0 + fixed seed + cached prompts. *Determinism:* shrinks the irreducible non-deterministic surface to near zero.
18. **Golden-output snapshot tests for generators** — commit expected output; fail on any unexplained diff. *Determinism:* catches generator drift the moment it appears.

### (4) Gates / verification
19. **`check_canonical` at the front of the pipeline** — keyed, real FKs, connected, no off-spec entity, no dead tables. *Determinism:* rejects fake IDs/broken links *before code is built.*
20. **`check_chain` — lifecycles wired end-to-end** — every state reachable and exited, every effect consumed. *Determinism:* no specced-but-dead workflow (the results/candidate_results split lesson).
21. **`check_access` — RBAC that actually works** — policy exists *and* is verified to enforce (not merely "present"). *Determinism:* closes the Lovable CVE-2025-48757 class (scanner checked presence, not correctness).
22. **`check_design` / no-raw-CRUD gate** — every screen field traces to canonical; workflow-shaped UI only. *Determinism:* UI can't diverge from the data model.
23. **`check_census` — handwritten-file gate** — every file is generated, frozen-kernel, or signed debt. *Determinism:* completeness gate; the governed surface is provably 100% derived.
24. **Journey gate (positive + fail-closed negative)** — every requirement has an executable acceptance test, both happy-path and a denied-path. *Determinism:* "done" is defined by a green executable test, not a claim (the spec↔test duality).
25. **Questions⇄gates duality audit** — a meta-gate asserting every question class has a matching gate and vice versa. *Determinism:* no fault-class can exist with elicitation-but-no-enforcement (v1's fatal gap).

### (5) Traceability / provenance
26. **Bidirectional trace graph (requirement ↔ source ↔ generated file ↔ test)** — answer InfoQ's *"which specification state produced this behavior?"* for any line of code. *Determinism:* generation is logically reversible; every artifact has provenance.
27. **Annotation provenance ledger** — each annotation → the source edit it produced → the regeneration it triggered → the gate run that proved it. *Determinism:* the visual layer is fully auditable; no silent visual drift.

### (6) Collaboration / review
28. **Spec-diff review (review the source change, not the code)** — PRs show the source-of-truth diff + the resulting generated diff + gate results. *Determinism:* humans review intent and provenance, not opaque AI mutations (Willison's "explain it or don't commit," made structural).

### (7) Determinism guarantees (cross-cutting)
- **Reproducibility receipt** — every build emits a manifest (source hash + generator versions + template hashes + gate results) so any build is replayable. *Determinism:* the build is a verifiable function of pinned inputs.

---

## C. Top determinism gaps in today's vibe-coding tools that source→derive→gate→prove closes

1. **No source of truth that is the system of record.** Tools treat code (or a chat) as truth; regeneration therefore can't be safe. *Versa closes it:* the keyed source is the only authored truth; code is a projection.
2. **Rules are advisory, not enforced.** `.cursorrules`, CLAUDE.md, Spec Kit constitution = injected context the model can ignore (*"a predictive engine, not a policy enforcer"*; Cursor ran `db push` against an explicit rule). *Versa:* gates are executable, not prompts.
3. **No requirement→code traceability.** You can't answer "which requirement produced this line?" *Versa:* the bidirectional trace graph + provenance ledger.
4. **Regeneration overwrites human/working code.** The model can't tell human-written from generated lines (v0, Lovable, Onlook all hit this). *Versa:* DO-NOT-EDIT generated surface + signed exception registry; humans only edit source.
5. **Non-determinism even at temp 0.** Same prompt → different output (75.76% of tasks; ~80 unique completions per 1,000 calls). *Versa:* deterministic generators are the spine; LLM use is pinned to batch-invariant inference + cached, and gated regardless.
6. **No drift gate.** *"Standard quality gates catch errors, not drift."* Specs and code silently diverge. *Versa:* `check_canonical`/`check_chain`/census are drift gates at the front of the pipeline.
7. **Security is un-gated by default.** RLS off in 7% of Bolt / 303 Lovable endpoints; 45% of AI code fails security tests. *Versa:* `check_access` proves policies *work*, not merely exist.
8. **Lifecycle/data-model integrity unenforced.** Orphan entities, dead tables, unkeyed identity, unwired chains (v1's exact failure). *Versa:* keyed canonical + end-to-end chain gates reject these before build.
9. **Acceptance is a claim, not a test.** "It works" ≠ a passing executable spec. *Versa:* every requirement carries a journey test (positive + fail-closed negative); the spec *is* the test.
10. **The visual layer is a parallel write path.** Visual edits map to messy/duplicate code and overwrite source. *Versa:* annotation is INTENT that folds into the source and is projected — never a second authoring surface.

---

## D. Named tools / citations (one-line takeaways)

**Spec-driven dev**
- [GitHub Spec Kit](https://github.com/github/spec-kit) — open-source SDD scaffold (`/specify`→`/plan`→`/tasks`) over any agent; Markdown specs, no reproducibility guarantee.
- [AWS Kiro](https://kiro.dev/docs/specs/) — spec-driven IDE; EARS requirements + tasks linked to requirements + steering files/hooks; strongest traceability, high friction.
- [Tessl](https://tessl.io/blog/tessl-launches-spec-driven-framework-and-registry/) — most radical (code = regenerable, `// GENERATED FROM SPEC`); wounded by non-determinism, pivoted Jan 2026.
- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) — agent-role orchestration methodology; organizes agents, not specs.

**Vibe coding & determinism**
- [Karpathy tweet](https://x.com/karpathy/status/1886192184808149383) — coined "vibe coding," scoped to throwaway projects.
- [Simon Willison](https://simonwillison.net/2025/Mar/19/vibe-coding/) — *"building software with an LLM without reviewing the code"*; "explain it or don't commit."
- [Böckeler / martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) — spec-first→anchored→as-source ladder; names the MDD+LLM risk.
- [Thinking Machines — Defeating Nondeterminism](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) — non-determinism = batch-invariance, fixable; 1,000 temp-0 calls made bit-identical.
- [Ouyang et al. (arXiv:2308.02828)](https://arxiv.org/abs/2308.02828) — temp 0 ≠ determinism; up to 75.76% of tasks vary across runs.

**AI app builders & critiques**
- [v0 composite model](https://vercel.com/blog/v0-composite-model-family) · [Bolt.new](https://github.com/stackblitz/bolt.new) · [Lovable Visual Edits](https://lovable.dev/blog/visual-edits) · [Replit prod-DB deletion (Fortune)](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) · [Cursor rules docs](https://cursor.com/docs/rules) · [Claude Code memory docs](https://code.claude.com/docs/en/memory) (need a hook to *block*).
- [Osmani — the 70% problem](https://addyo.substack.com/p/the-70-problem-hard-truths-about) · [Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/) · [slopsquatting (arXiv:2406.10279)](https://arxiv.org/abs/2406.10279) · [InfoQ — Spec-Driven Development](https://www.infoq.com/articles/spec-driven-development/) (*"code is no longer the system of record; the specification is"*).

**Single-source codegen (the blueprint)**
- [OpenAPI Generator](https://openapi-generator.tech/) · [Prisma](https://www.prisma.io/docs/orm) (*"single source of truth"*) · [Protocol Buffers](https://protobuf.dev/) + [buf](https://buf.build/docs/) (breaking-change gate) · [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript) ("DO NOT MODIFY BY HAND") · [Django models](https://docs.djangoproject.com/en/stable/topics/db/models/) · [Hasura](https://hasura.io/docs/)/[PostgREST](https://postgrest.org/) (API from schema introspection — no second copy).

**Requirements engineering**
- [Zachman Framework](https://en.wikipedia.org/wiki/Zachman_Framework) — maps the 6 interrogatives to 6 architecture columns; independent & non-redundant.
- [EARS (Alistair Mavin)](https://alistairmavin.com/ears/) — 5 constrained requirement templates; atomic, testable.
- [Given-When-Then (Fowler)](https://martinfowler.com/bliki/GivenWhenThen.html) · [Gherkin (Cucumber)](https://cucumber.io/docs/gherkin/reference/) · [Specification by Example (Adzic)](https://gojko.net/2020/03/17/sbe-10-years.html) — the example *is* the spec *is* the test.

**Visual intent capture**
- [Onlook](https://github.com/onlook-dev/onlook) — open-source `data-oid` build-time instrumentation; code-as-source-of-truth (closest analogue).
- [Builder.io Visual Copilot](https://www.builder.io/blog/figma-to-code-visual-copilot) — Figma→code via Mitosis + component mapping to your repo.
- [Figma Code Connect](https://www.figma.com/blog/introducing-code-connect/) / [Dev Mode MCP](https://www.figma.com/blog/introducing-figma-mcp-server/) — default codegen is *"reference-grade, not ship-grade."*
- [Webflow export limits](https://help.webflow.com/hc/en-us/articles/33961386739347-How-do-I-export-my-Webflow-site-code) · [Anima](https://www.animaapp.com/figma) · [Locofy](https://www.locofy.ai/) — one-way, overwrite-on-regenerate, tokens flattened.
