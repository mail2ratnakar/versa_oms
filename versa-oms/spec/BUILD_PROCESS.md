# Build Process — the canonical loop for every change

This is THE ordered process for any fix/feature. It ties together the other docs; follow it top
to bottom, every time. No ad-hoc code edits, no skipping steps.

## ⛔ INVIOLABLE RULE — never relax a spec (founder mandate 2026-06-25)

**Do NOT relax, weaken, loosen, or remove ANY spec, schema constraint (NOT NULL / UNIQUE / FK /
CHECK), validation, guard, permission, policy, or control — under ANY circumstances — to make
implementation or testing easier.** A constraint is binding; it is a feature, not an obstacle. If a
constraint genuinely appears wrong or is truly blocking correct work, **STOP and ASK the founder
first**, with evidence — never change it unilaterally. (Example of the mistake this rule exists for:
relaxing `notification_batches.template_id NOT NULL` to avoid seeding a template — a required template
is a legitimate control; the fix is to RESOLVE a template, not bypass the constraint.) The honest move
when a constraint blocks you is almost always to satisfy it (seed the parent, resolve the value,
surface the gap), not to drop it. This applies even to constraints that *look* like over-constraints —
ask before touching them.

Supporting docs (each step links to one):
- `spec/brain/BRAIN_INDEX.md` — the **founder brain** (mindset ABOVE skills/principles: what "complete" means, gap heuristics, bug-fix-as-journey, readiness labels, when to stop) + `spec/brain/FOUNDER_BRAIN_CHECKLIST.md`
- `generators/spec_playbook/config/source_of_truth_schema.json` — the **14 parameters**
- `spec/skills/SKILLS_INDEX.md` — the **skills dictionary** (HOW to read specs/JSONs/canonical for each layer; read the relevant skill before touching that layer) + `spec/skills/SKILL_APPLICATION_CHECKLIST.md`
- `spec/WORKFLOW_CHECKLIST.md` — the per-element data/spec checks
- `spec/PRINCIPLES.md` — the principles dictionary (exhaustive pass)
- `spec/ARCH_RUNTIME_CHECKLIST.md` — the **Architectural & Runtime Keyword Checklist** (founder doc): the mandatory engineering gate for writing code that survives real users, bad input, retries, failures, concurrency, security attacks, and infra issues. Applied at implement (step 7), test (step 8), and pre-completion (step 9). "Do not write code only to make the page compile."
- `spec/WORKFLOW_REGISTRY.json` + `reports/WORKFLOW_STATUS.md` (run `_validation/check_workflows.py`) — the **workflow dictionary**: the end-to-end business chains (WF-001…WF-016) mapped to our modules + e2e specs, with completion status DERIVED from `tests/e2e`. **Work workflow-at-a-time** (see step 0).
- `spec/SPEC_DRIVEN_METHOD.md` — the generator pipeline + drift guardrail
- `implementation/CANONICAL_DATA_MODEL.json` — the data source of truth (NOT spec/modules/*/schema.json collections)

---

## The loop

**0. Request + brain + pick the workflow.** The user asks for a fix/feature, or an auditor surfaces a gap. Enter with the founder mindset (`spec/brain/`): "complete" = consequence·visibility·persistence·proof; a bug is a missing layer (feature→actor→screen→API→state→DB→effect→audit→journey), not a symptom to patch; use accurate readiness labels and never claim done without evidence (`FOUNDER_BRAIN_CHECKLIST.md`). **WORK WORKFLOW-AT-A-TIME (founder rule 2026-06-25):** code one END-TO-END business chain at a time, not scattered bits. Run `_validation/check_workflows.py` and read `reports/WORKFLOW_STATUS.md`; take the next chain in execution order (the lowest-priority `planned`/`partial` whose deps are built) and drive it to **built** — every module wired (service + UI page, P0.10) and a passing e2e journey through all gates — before starting another chain. Each CR should advance the *current* workflow toward built; don't open CRs across unrelated chains and lose context (anti-hallucination: no random-file / API-only / screen-only / partial-chain completion). If the user names a specific feature, place it in its workflow and finish that chain's gap.

**1. CR.** Write `spec/modules/<m>/feature_requests/FR-<MODULE>-<YEAR>-<NNNN>.json` (from `feature_request_template.json`). One CR per change; it's the record of intent.

**2. 14-parameter row.** Fill the source-of-truth 14 parameters inside the CR (`param_14`):
`question_id · section · question · answer · answer_source · confidence · affected_modules · data_entities · workflow_entities · security_implications · approval_implications · downstream_dependencies · assumptions · needs_user_review`.
This forces the modules/data/workflow grounding + the risk surface (security/approval/downstream) up front. **`downstream_dependencies` is where hidden work hides** (e.g. "the list must filter server-side") — fill it honestly.

**3. Load the relevant skill(s) (skills dictionary).** Before reading or writing ANY spec, `*.json`, screen, migration, or `CANONICAL_DATA_MODEL.json` for this change, open `spec/skills/SKILLS_INDEX.md` and read the skill(s) whose layer the current action touches — i.e. match the files/folders you're about to touch to skills:
   - data / canonical / `schema.json` → `01 Spec Interpreter` + `06 Database Migration`
   - an action's after-effects (`workflows.json`, `chains.json`, tasks, notifications, audit) → `02 Effect Chain` + `09 Audit Idempotency`
   - a screen / `screens.json` / `ModuleTable` → `03 Screen Contract` + `13 UI Design System`
   - routes / actions spec / envelopes → `05 API Contract`
   - auth / scope / `security.json` / masking → `07 Auth RBAC Scope` + `08 Security Privacy`
   - files / signed URLs → `10`; async/workers → `11`; observability → `12`; seed/tests → `14`
   State which skills you read and which of their checks are satisfied; if a check can't be met, STOP and report the gap (`17 Gap Detection`) rather than improvising. No coding before the relevant skills are applied (`spec/skills/SKILL_APPLICATION_CHECKLIST.md`).

**4. Check the modules + their JSONs.** For each `affected_module`, read its own files — `workflows.json`, `lifecycle_states.json`, `security.json`, `*_policy.json`, `*_field_policy.json`, `schema.json` (for intent), `screens.json` — AGAINST `CANONICAL_DATA_MODEL.json` (the real columns/types/nullability). Run `check_schema_drift.py` + `audit_modules.py`. (= `WORKFLOW_CHECKLIST.md` steps 1–2.)

**5. Principles pass (exhaustive).** Run `PRINCIPLES.md` against EVERY element of the change (every field/column/action/filter). **Show the user the per-element field→control→verdict table** before any code (P0.4).

**6. Approve.** User approves the feature set + resolves any `needs_user_review` items. Only then proceed.

**7. Implement — spec-first, runtime-hardened.** Edit the SPEC (screen/actions/schema/workflow/effect), then regenerate with `gen_*.py`. Never hand-edit generated output (`// GENERATED … DO NOT EDIT`). Reuse existing schema/enums; avoid needless migrations (P0.5). **NEVER HARDCODE — GENERALIZE (founder rule 2026-06-25):** do not bake magic literals, fixed IDs / emails / codes / paths / URLs, seed-specific values, fixed counts, or environment specifics into code OR tests. Resolve every value from its source of truth — config, the DB row, the spec/policy JSON, an env var, or a function parameter — so the logic works for ALL inputs, not one. A test must READ the value it checks from the source (the row/API/config) and compare, never assert a copied literal (e.g. read `schools.coordinator_email` and assert the resolved address equals it — don't hardcode `"ch3@versa.local"`). Hardcoding is a defect even when it passes. **Apply `ARCH_RUNTIME_CHECKLIST.md`**: answer its Section 0 pre-code questions first (feature·actor·screen·API·DB·transition·effect·audit·security·journey·which sections apply), then while writing EACH file apply every relevant per-domain section — Data/Input integrity (§2: validation, forbidden fields, enums, ranges, CSV-injection, masking), Security/Privacy (§3) + Auth/RBAC/RLS (§4) (server-side role/scope, deny-by-default, cross-school isolation, never trust the §22 browser-input list), Idempotency (§5), Transaction/Concurrency (§6), State-machine/Lifecycle (§7), Audit (§8), High-risk action (§9: reason + maker-checker + self-approval-block), File/Signed-URL (§10), Worker queue (§11), Resilience (§12), Performance (§13: pagination + hard page-size cap + N+1), Observability (§14), UI (§15). "Code that survives real users, bad input, retries, failures, concurrency, security attacks — not code that only compiles." **WIRE THE UI END-TO-END — UPSTREAM + DOWNSTREAM (founder rule 2026-06-25):** every CR must be REACHABLE and USABLE in the actual app by its real actor — not just an API/endpoint. Wire BOTH ends of the flow: the **upstream entry** (the screen/page/button/form/action/upload-or-download control where the user triggers it, reachable from nav — P1.10) AND the **downstream visibility** (where the result/new status/produced record/audit shows up — the table row, detail panel, status badge, download link, recipient list, etc.). The journey must be clickable in real working mode: a user can navigate to it, do it, and SEE the outcome. Reuse the generated pages / `ModuleTable` / actions (edit the screen/actions spec + regenerate; don't hand-edit generated output). A feature whose UI isn't wired is INCOMPLETE — it fails the §16 Journey Completion gate (step 9) and P0.7. (If a CR is genuinely backend-only infra with no actor-facing surface, state that explicitly and why.)

**8. Tests — functional + security + concurrency (P4.6).** Enumerate the units of the feature and write + run a test for EACH across three dimensions: (a) **functional** (each filter, pill, pagination, empty state, a record rendering past page 1, scope, masking); (b) **security (OWASP)** (access-control/IDOR, fail-closed guards, injection/input validation, mass-assignment/forbidden-field rejection, sensitive-data masking, idempotency conflict); (c) **concurrency** (concurrent transitions from one from-state, idempotency-key replay, dual-approval double-submit, parallel unique-code inserts). Use the `ARCH_RUNTIME_CHECKLIST.md` §17 test matrices for the feature's class (normal / high-risk → dual-approval + self-approval-blocked + reason + rollback; file → signed-URL-expiry + unauthorized-download + raw-path-not-returned; worker → success/retry/DLQ/idempotency/safe-logging; privacy → masking + cross-school + public-minimal). Fix bugs as they surface. Counts being right ≠ records being visible. Record every test in `spec/TEST_REGISTRY.md` (P4.7).

**9. Verify + completion gate.** `npx tsc --noEmit` + `npx vitest run` + the JRN e2e (positive + a fail-closed negative) + `check_generated.py` (drift guardrail, on a clean tree) + `check_unique_constraints.py` + **`check_no_raw_crud_ui.py` (BUSINESS-USABLE SCREEN DESIGN GATE — 0 violations: FKs = reference pickers, enums = selects, no payload/uuid/`*_by`/status-edit/generic-CRUD — P0.12)** + **`check_design_conformance.py` (DESIGN-SYSTEM GATE — 0: every portal page composes the Versa design system / `@/components/design`; all required COMPONENT_INVENTORY components available — P0.13)** + **`check_a11y.py` (ACCESSIBILITY GATE — 0: icon-only buttons have aria-labels, images have alt, inputs are label-associated — ACCESSIBILITY_RULES.md / P0.13)** + the auditor reflects the change. Then run the `ARCH_RUNTIME_CHECKLIST.md` completion gate: **§16 Journey Completion** must pass (actor→action→API→DB→audit→effect→UI→unauthorized-blocked→masked→test) — if any item is missing, do NOT claim complete; honor the **§20 Stop Conditions** (stop + report if an effect chain / journey test / role-scope rule / sensitive-field rule is unclear, or a destructive migration / real credential is required — and per the Inviolable Rule, before relaxing any constraint); and produce the **§19 Pre-Commit Review** (FEATURE · FILES · SCREENS · APIS · DB · EFFECT CHAINS · AUDIT EVENTS · SECURITY/PRIVACY CHECKS · TESTS ADDED · COMMANDS RUN · RESULT · REMAINING GAPS · READINESS LABEL) with an accurate §19 readiness label.

**10. Commit.** CR + spec + generated output + tests together, with a message that names the CR.

**11. Update status everywhere (MANDATORY — founder rule 2026-06-25).** A loop is not done until status is current in ALL of:
   - **Persistent memory** — `.claude/projects/.../memory/versa-oms-state-of-build.md` (one concise dated entry per CR) + its `MEMORY.md` index line. This is what a restart reads.
   - **Build log** — append a dated row to `reports/BUILD_LOG.md` (chronological per-CR: what shipped + verify evidence + deferred).
   - **Build status snapshot** — `reports/BUILD_STATUS.md` (current-state: tests/migrations/recently-completed).
   - **Audit reports** — the auditor outputs that changed (`reports/MODULE_GAP_AUDIT.md` via `audit_modules.py`; update `reports/SPEC_VS_BUILT_GAP.md` readiness when a module's gap closes).
   - **Session handoff** — `.remember/remember.md` (next-session continuation pointer).
   Never leave status stale; "status updated everywhere" is part of the definition of done (P0.7).

---

## Why each step exists (learned the hard way)
- **Load the relevant skill(s)** — the skills dictionary encodes HOW to read each layer (specs/JSONs/canonical) and what "done" means for it; reading the matching skill before touching that layer prevents improvising behavior the spec already defines (e.g. effects/audit/scope checks skipped because the layer's checklist wasn't consulted).
- **CR + 14-param** — catches downstream work before coding (the CRM toolbar's server-side filtering was found at param 12, not at test time).
- **Canonical, not spec collections** — `verification_url` was read from a spec collection that wasn't a real column.
- **Exhaustive principles pass** — `state` was left as free text while `country`/`board` became dropdowns.
- **Unit tests after** — facet counts were right but page-2 records were unreachable (no pagination test).
