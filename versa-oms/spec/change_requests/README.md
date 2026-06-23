# Change Requests — index

**Change requests live PER MODULE**, using the framework's built-in templates that
every module already ships:
- `spec/modules/<module>/feature_request_template.json` — the schema for a feature CR
- `spec/modules/<module>/bug_fix_template.json` — the schema for a bug-fix CR
- `spec/modules/<module>/change_control.json` — the module's change-control policy

A change request is a file `spec/modules/<module>/feature_requests/FR-<MODULE>-<YEAR>-<NNNN>.json`
following `feature_request_template.json` (fields: `change_id`, `change_type`, `title`,
`requested_by`, `business_reason`, `impact_area`, `requires_*_change`, plus
`target_specs` / `regenerate` / `verify` / `approval_status`).

## The flow (binding — see ../SPEC_DRIVEN_METHOD.md)
1. Write the CR in the module's `feature_requests/` folder (copy its `feature_request_template.json`).
2. Apply the edit to the **target spec** (workflows / screens / actions / effects / schema / …).
3. Run the generator(s) listed in the CR.
4. Run the verify step (vitest + the JRN e2e).
5. Set `approval_status: applied`.

Never hand-edit generated output. If you ask for a change, it is captured as a CR first,
then acted on against the spec.

## Examples
- `spec/modules/school_onboarding_ops/feature_requests/FR-SCHOOL-ONBOARDING-OPS-2026-0002.json`
  — fixed the unreachable `under_review` so the generated guard allows approve from `submitted`.

This top-level folder is just the index + template convenience; the authoritative home is per module.
