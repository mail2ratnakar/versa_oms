# Exam Materials Module — Final Modular Design

The Exam Materials module is an independent, versioned module under:

```text
/spec/modules/exam_materials/
```

It is generated after Schools, Students, Payments and Exam Slots because material release depends on school scope, candidate IDs, payment clearance and confirmed exam schedule.

## Module position

```text
Core spec
  ↓
Schools module
  ↓
Students module
  ↓
Payments module
  ↓
Exam Slots module
  ↓
Exam Materials module
  ↓
Courier / OMR / Results / Certificates
  ↓
Shared security baseline
  ↓
Change requests
  ↓
Regression tests
  ↓
Runbook execution
```

## Non-negotiable rules

1. Exam materials are private by default.
2. Public material URLs are forbidden.
3. Payment must be complete before material release.
4. Exam slot must be confirmed before material release.
5. Student candidate IDs must exist before OMR/attendance generation.
6. Release time is enforced server-side.
7. School can download only own materials.
8. Every download is audited.
9. Revocation blocks future downloads.
10. Material changes require versioning and audit.

## Future extension examples

Possible future features:

- Watermarked question papers
- Password-protected PDFs
- Encrypted material bundles
- Timed one-click school release
- Multi-subject material bundles
- Download OTP
- Print-center material package

## Bug fix continuity

Every exam material module bug fix must add a regression test, especially for release gates, private files, school isolation and download audit.
