# Evaluation, Scoring and Results Threat Model

Domain id: `evaluation_results`

## Assets
- answer keys
- OMR imports
- candidate responses
- scores
- score batches
- results
- rank snapshots

## Trust Boundaries
- OMR import upload
- evaluation API
- results publication workflow
- school result visibility

## Key Threats

### THR-EVAL-001 — Answer key or OMR scores altered after approval

- Category: `tampering`
- Risk: **critical**
- Impact: Wrong results, trust loss and certificate invalidity.
- Mitigations:
  - `answer_key_versioning`
  - `score_batch_versioning`
  - `approval_required`
  - `no_overwrite_after_approval`
  - `audit_scoring`
- Required tests:
  - `approved_answer_key_not_overwritten`
  - `score_recalculation_creates_new_version`
  - `score_batch_approval_required`

### THR-RES-001 — Published result correction lacks traceability

- Category: `repudiation`
- Risk: **critical**
- Impact: School/student disputes cannot be resolved.
- Mitigations:
  - `published_result_versioning`
  - `correction_reason_required`
  - `certificate_impact_review`
  - `audit_result_events`
- Required tests:
  - `published_result_correction_creates_new_version`
  - `correction_requires_reason`
  - `certificate_impact_review_required`

## Required Controls

- Server-side authorization.
- Field masking where sensitive.
- Audit events for state changes.
- Reason capture for high-risk actions.
- No hard delete.
- Maker-checker or dual approval where configured.
- Feature flag or kill-switch where exposure risk exists.

## Implementation Stop Conditions

- Browser-trusted scope/status/approval detected.
- Sensitive file URL exposed.
- Missing audit event.
- Missing security test.
- Missing rollback handling for high-risk action.
