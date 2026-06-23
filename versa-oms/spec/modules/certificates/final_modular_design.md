# Certificates Module — Final Modular Design

The Certificates module is an independent, versioned module under:

```text
/spec/modules/certificates/
```

It is generated after Results because certificate generation depends on published result rows and student/school identity.

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
Courier module
  ↓
OMR Imports module
  ↓
Results module
  ↓
Certificates module
  ↓
Notifications / Audit
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

1. Certificates generate only from published results.
2. Withheld, revoked or superseded results are not certificate eligible.
3. Certificate PDFs are private.
4. School coordinators download only own school certificates.
5. Public verification returns minimal fields only.
6. Verification code is unique and non-guessable.
7. Certificate number is globally unique.
8. Issued certificate snapshots are immutable.
9. Corrections require revoke/supersede/reissue workflow.
10. All generation, download, verification and revocation events are audited.

## Future extension examples

Possible future features:

- Digital signatures through DocuSeal
- Certificate wallet/share page
- Parent/student direct certificate download
- Bulk school certificate ZIP
- Multi-language certificate templates
- Certificate reissue request workflow

## Bug fix continuity

Every Certificates module bug fix must add a regression test, especially for published-result gate, school isolation, private PDFs, verification privacy and revocation.
