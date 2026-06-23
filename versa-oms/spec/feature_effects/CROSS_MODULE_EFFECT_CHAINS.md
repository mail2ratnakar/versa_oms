# Cross-Module Effect Chains

## CHAIN-001 — CRM Lead Conversion to Onboarding

Trigger: `school_crm.convert_to_onboarding`

1. lead.stage=converted
2. school created/linked
3. onboarding_case created
4. onboarding task assigned
5. dashboard and onboarding queue update
6. audit written

## CHAIN-002 — Onboarding Activation to School Portal Access

Trigger: `school_onboarding_ops.activate_school`

1. school.status=active
2. portal access enabled
3. school notified
4. roster upload enabled
5. audit written

## CHAIN-003 — Roster Lock to Exam Readiness

Trigger: `student_roster_ops.lock_roster`

1. batch.status=locked
2. candidate IDs generated
3. eligibility created
4. finance/slot/material gates can evaluate
5. audit written

## CHAIN-004 — Finance Paid to Material Eligibility

Trigger: `finance_ops.confirm_manual_payment`

1. payment.status=paid
2. finance gate opens
3. material generation allowed if roster+slot pass
4. school payment UI updates
5. audit written

## CHAIN-005 — Slot Confirmation to Material Readiness

Trigger: `exam_slot_ops.confirm_slot`

1. assignment.status=confirmed
2. readiness recalculated
3. material generation allowed if paid+roster locked
4. audit written

## CHAIN-006 — Material Release to School Download

Trigger: `exam_material_ops.approve_release`

1. package approved
2. release window scheduled
3. school sees material after time
4. signed URL generated after checks
5. download audited

## CHAIN-007 — Evaluation to Results

Trigger: `evaluation_ops.generate_scores`

1. score batch generated
2. exceptions flagged
3. result generation enabled after approval
4. audit written

## CHAIN-008 — Results Publication to Certificate Eligibility

Trigger: `results_ops.publish_results`

1. results published
2. school result visible
3. certificate eligibility created
4. notification queued
5. audit written

## CHAIN-009 — Certificate Publication to Public Verification

Trigger: `certificate_ops.publish_certificates`

1. certificates available
2. verification record active if flag enabled
3. public minimal response
4. audit written

## CHAIN-010 — Sensitive Export Approval to Download

Trigger: `reports_exports.request_sensitive_export`

1. export request pending approval
2. approval task created
3. private file generated
4. signed URL created
5. download audited
