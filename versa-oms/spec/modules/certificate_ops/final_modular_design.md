# Certificate Ops Module — Final Modular Design

The Certificate Ops module is the thirteenth company/internal portal module under:

```text
/spec/modules/certificate_ops/
```

It controls certificate templates, eligibility snapshots, generation, publication, school download, public verification, reissue, revocation and result-correction impact.

## Module position

```text
company_dashboard
  ↓
staff_users
  ↓
roles_permissions
  ↓
school_crm
  ↓
school_onboarding_ops
  ↓
student_roster_ops
  ↓
finance_ops
  ↓
exam_slot_ops
  ↓
exam_material_ops
  ↓
courier_ops
  ↓
evaluation_ops
  ↓
results_ops
  ↓
certificate_ops
  ↓
notification_ops
  ↓
support_tickets
  ↓
task_work_queue
  ↓
reports_exports
  ↓
admin_settings
  ↓
security_audit_console
```

## Non-negotiable rules

1. Certificate generation requires published result.
2. Certificate generation requires eligibility snapshot.
3. Withheld, voided or superseded results are not eligible by default.
4. Template must be active and approved.
5. Certificate number and verification code are unique.
6. Certificate files are private.
7. School downloads are own-school scoped.
8. Public verification exposes minimal fields only.
9. QR code contains verification URL/code only, never raw PII or score.
10. Reissue requires reason and approval and creates a new version.
11. Revocation requires reason and approval.
12. Revoked certificate cannot be downloaded.
13. Verification shows revoked status for revoked certificates.
14. Result correction requires certificate impact review.
15. Certificate records are never hard-deleted.

## Bug fix continuity

Every Certificate Ops bug fix must add a regression test, especially for eligibility, template activation, certificate number uniqueness, school scope, public verification, reissue, revocation, download blocking and result-correction impact.
