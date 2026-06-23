# School Onboarding Ops Module — Final Modular Design

The School Onboarding Ops module is the fifth company/internal portal module under `/spec/modules/school_onboarding_ops/`.

It converts school CRM intent into verified and activated school participation readiness.

## Non-negotiable rules

1. School onboarding staff workflow is staff-only.
2. Public and school roles cannot approve/edit/block onboarding through staff APIs.
3. School identity verification is required before approval.
4. Duplicate school check is required before approval.
5. Coordinator email verification is required before approval and activation.
6. Documents are optional in MVP but private and required for high-risk cases.
7. Rejection requires reason.
8. School portal activation requires approved case and school_user mapping.
9. Post-approval sensitive edits require reason.
10. Block/suspend requires reason.
11. Downstream modules must check school status controls.
12. SLA tracking is required.
13. Hard delete is forbidden.
14. Every status change is audited.

## Future extension examples

Coordinator mobile OTP verification, school document OCR, automated duplicate matching, region-based reviewer assignment, onboarding risk score, and self-service onboarding wizard.
