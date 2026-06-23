# Certificate Ops Module Runbook

## Purpose

Build the Certificate Ops module after Results Ops because certificates require published result snapshots and certificate eligibility.

## Required order

1. Confirm `results_ops` exists.
2. Confirm `student_roster_ops` exists.
3. Confirm `school_onboarding_ops` exists.
4. Create `certificate_templates`.
5. Create `certificate_eligibility_snapshots`.
6. Create `certificates`.
7. Create `certificate_requests`.
8. Create `certificate_download_events`.
9. Create `certificate_events`.
10. Configure template versioning and approval.
11. Configure eligibility sync from published results.
12. Configure certificate generation and numbering.
13. Configure school-scoped download.
14. Configure public verification route.
15. Configure reissue/revocation workflow.
16. Configure result-correction certificate impact workflow.
17. Implement APIs from `messages.json`.
18. Implement screens from `screens.json`.
19. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Certificate can generate from unpublished or withheld result.
- Certificate can generate without eligibility snapshot.
- School can download another school's certificate.
- Public verification exposes score details or raw PII.
- QR contains PII or score data.
- Revoked certificate can be downloaded.
- Reissue does not create new version.
- Result correction skips certificate impact review.
- Browser-submitted eligibility/status/scope is trusted.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Certificate Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
