# Students Module — Final Modular Design

The Students module is an independent, versioned module under:

```text
/spec/modules/students/
```

It is generated after the Schools module because every student must be scoped to `school_id` and `participation_id`.

## Module position

```text
Core spec
  ↓
Schools module
  ↓
Students module
  ↓
Payments / Exam Slots / Materials / Courier / OMR / Results / Certificates
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

1. `school_id` must be derived from authenticated school user mapping.
2. Student upload files are private.
3. No student record is public in MVP.
4. Parent contact data is avoided unless explicitly approved.
5. Consent must be true before finalisation.
6. Candidate IDs must be stable and unique.

## Future extension examples

```text
/modules/students/
  feature_request_template.json
```

Possible future features:

- Manual single-student entry
- Student edit request workflow
- Parent individual consent link
- Multi-subject student registration
- Advanced duplicate matching

## Bug fix continuity

Every student module bug fix must add a regression test, especially for school isolation, consent, candidate ID uniqueness and upload parsing.
