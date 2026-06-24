# Build Process — the canonical loop for every change

This is THE ordered process for any fix/feature. It ties together the other docs; follow it top
to bottom, every time. No ad-hoc code edits, no skipping steps.

Supporting docs (each step links to one):
- `generators/spec_playbook/config/source_of_truth_schema.json` — the **14 parameters**
- `spec/WORKFLOW_CHECKLIST.md` — the per-element data/spec checks
- `spec/PRINCIPLES.md` — the principles dictionary (exhaustive pass)
- `spec/SPEC_DRIVEN_METHOD.md` — the generator pipeline + drift guardrail
- `implementation/CANONICAL_DATA_MODEL.json` — the data source of truth (NOT spec/modules/*/schema.json collections)

---

## The loop

**0. Request.** The user asks for a fix/feature, or an auditor surfaces a gap.

**1. CR.** Write `spec/modules/<m>/feature_requests/FR-<MODULE>-<YEAR>-<NNNN>.json` (from `feature_request_template.json`). One CR per change; it's the record of intent.

**2. 14-parameter row.** Fill the source-of-truth 14 parameters inside the CR (`param_14`):
`question_id · section · question · answer · answer_source · confidence · affected_modules · data_entities · workflow_entities · security_implications · approval_implications · downstream_dependencies · assumptions · needs_user_review`.
This forces the modules/data/workflow grounding + the risk surface (security/approval/downstream) up front. **`downstream_dependencies` is where hidden work hides** (e.g. "the list must filter server-side") — fill it honestly.

**3. Check the modules + their JSONs.** For each `affected_module`, read its own files — `workflows.json`, `lifecycle_states.json`, `security.json`, `*_policy.json`, `*_field_policy.json`, `schema.json` (for intent), `screens.json` — AGAINST `CANONICAL_DATA_MODEL.json` (the real columns/types/nullability). Run `check_schema_drift.py` + `audit_modules.py`. (= `WORKFLOW_CHECKLIST.md` steps 1–2.)

**4. Principles pass (exhaustive).** Run `PRINCIPLES.md` against EVERY element of the change (every field/column/action/filter). **Show the user the per-element field→control→verdict table** before any code (P0.4).

**5. Approve.** User approves the feature set + resolves any `needs_user_review` items. Only then proceed.

**6. Implement — spec-first.** Edit the SPEC (screen/actions/schema/workflow/effect), then regenerate with `gen_*.py`. Never hand-edit generated output (`// GENERATED … DO NOT EDIT`). Reuse existing schema/enums; avoid needless migrations (P0.5).

**7. Unit tests (P4.6).** Enumerate the units of the feature (each filter, pill, pagination, empty state, a record rendering past page 1, scope, masking) and write + run a test for EACH. Fix bugs as they surface. Counts being right ≠ records being visible.

**8. Verify.** `npx tsc --noEmit` + `npx vitest run` + the JRN e2e (positive + a fail-closed negative) + `check_generated.py` (drift guardrail, on a clean tree) + the auditor reflects the change.

**9. Commit.** CR + spec + generated output + tests together, with a message that names the CR.

---

## Why each step exists (learned the hard way)
- **CR + 14-param** — catches downstream work before coding (the CRM toolbar's server-side filtering was found at param 12, not at test time).
- **Canonical, not spec collections** — `verification_url` was read from a spec collection that wasn't a real column.
- **Exhaustive principles pass** — `state` was left as free text while `country`/`board` became dropdowns.
- **Unit tests after** — facet counts were right but page-2 records were unreachable (no pagination test).
