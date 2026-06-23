# Schools Module — Final Modular Design

The Schools module is an independent, versioned module under:

```text
/spec/modules/schools/
```

It is the first operational module because every downstream student, payment, exam, courier, result and certificate record depends on `school_id`.

## Module position

```text
Core spec
  ↓
Schools module
  ↓
Students / Payments / Exam Slots / Materials / Courier / Results / Certificates
  ↓
Shared security baseline
  ↓
Change requests
  ↓
Regression tests
  ↓
Runbook execution
```

## Non-negotiable rule

`school_id` must always be derived from the authenticated user's `school_users` mapping. It must never be trusted from a browser-submitted field.

## Future extension example

```text
/modules/schools/
  feature_request_template.json
```

Example future feature: multi-coordinator support, school branch mapping, school principal approval, invite-only school onboarding.

## Bug fix continuity

Every school module bug fix must update `bug_fix_template.json` usage and add a regression test, especially for school-level isolation.
