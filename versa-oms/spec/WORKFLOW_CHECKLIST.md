# Per-Workflow Build Checklist (anti-drift)

**Rule:** before building ANY workflow/action (staff or school), run this checklist. It exists
because we kept discovering the same two drift classes mid-e2e: conditional NOT-NULL columns,
and reading the wrong schema source. Catch them up front, not at test time.

**Companion:** `PRINCIPLES.md` — the frozen principles dictionary (UI/data/workflow/security/spec-driven).
Apply its principles to EVERY element, and show the per-element pass to the user before coding.

Run the two auditors first:
- `python _validation/check_schema_drift.py --dbcols -` (piped DB cols) — conditional NOT-NULL + canonical/DB drift
- `python _validation/audit_modules.py` — what's declared vs implemented, both portals

## 1. DATA MODEL — source of truth is `implementation/CANONICAL_DATA_MODEL.json`
The canonical model is what generated the DDL. **Do NOT take column names from `spec/modules/<m>/schema.json` collections** — collections carry fields that were merged/dropped and never became table columns (this is how the `verification_url` mistake happened). Verify against canonical, or against the live DB.
- [ ] Entity table exists in canonical; list its REAL columns from canonical.
- [ ] NOT-NULL-no-default columns: which MUST be on create? Conditional ones (`*_by`, `*_reason`, `*_evidence`, `*_file`, optional FKs) should already be nullable via migration 0018 — if a new one appears, add it there, don't write a one-off migration.
- [ ] Status column NAME + `allowed_values` (don't assume `status`; e.g. `batch_status`, `assignment_status`).
- [ ] Business code column (NOT-NULL `*_code`) → needs kernel `codeColumn`/`codePrefix`.
- [ ] FK columns + targets (for school-scope `schoolColumn`, links, preconditions).

## 2. SPECS — both portals (both-sides rule)
- [ ] `workflows.json`: the entity's transitions + **ACTOR per transition** → classify school-side vs staff-side vs system. Build the action on the side whose actor owns it.
- [ ] Guards on each transition → map in `spec/guards/guard_checks.json` (gen_guards emits the precondition) or accept as tracked-unmapped.
- [ ] `security.json`: permission class + masking for the action's fields.
- [ ] `*_policy.json`: any policy gating the action (e.g. payment_link_requires_school_active).

## 3. FEATURE / SCREEN / EFFECTS — features-pack
- [ ] `features.json`: the declared feature this action satisfies.
- [ ] `spec/screens/*.screen.json`: the screen contract for this action.
- [ ] `spec/effects/chains.json`: any cross-module effect the transition triggers (post-apply). If none, the action is a plain guarded transition (most are — don't invent a chain).

## 4. UI WIRING — confirm the action actually surfaces (don't trust e2e alone; it hits the API)
- [ ] The button/form is GENERATED: staff `actions_for`, or school `SCHOOL_ACTIONS` / `SCHOOL_DOWNLOADS` / `createFields` in gen_ui.
- [ ] `ModuleTable` wiring: `actions` → `POST endpoint/[id]/actions/[action]`; `createFields` → `POST endpoint`; `downloadAction` → `GET endpoint/[id]/download`.
- [ ] `isActionAllowedFrom`: the row-status gate shows the button when expected (defaults to true when the module isn't in TRANSITION_GUARDS).
- [ ] Open the generated `page.tsx` and confirm the prop is present.

## 5. VERIFY
- [ ] Regenerate (gen_*) + `python _validation/check_generated.py` (drift guardrail clean).
- [ ] `npx tsc --noEmit` + `npx vitest run`.
- [ ] JRN e2e for the action end-to-end (positive + a fail-closed negative).
- [ ] `python _validation/audit_modules.py` reflects the new action.
