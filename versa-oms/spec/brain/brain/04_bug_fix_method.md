# 04 — Bug Fix Method

## Founder Bug Fix Rule

Do not fix only the symptom.

Diagnose the feature journey.

## Bug Diagnosis Chain

```text
Bug observed
↓
Which feature?
↓
Which actor?
↓
Which screen?
↓
Which API?
↓
Which state transition?
↓
Which database record?
↓
Which downstream effect?
↓
Which audit event?
↓
Which test should have caught this?
↓
Smallest correct fix
↓
Add/repair test
↓
Update completed/pending summary (reports/BUILD_STATUS.md)
```

## Bug Fix Output Format

Every bug fix must produce:

```text
BUG:
ROOT CAUSE:
MISSING CONTRACT:
FILES CHANGED:
TEST ADDED:
COMMANDS RUN:
RESULT:
REMAINING GAP:
```

## Example

Bug:

```text
Converted lead did not appear in onboarding.
```

Bad fix:

```text
Change button label or mark lead converted.
```

Correct fix:

```text
CRM convert action must:
- update lead.stage=converted
- create/link school
- create onboarding_case
- create onboarding task
- update onboarding queue
- write audit event
- pass CRM-JRN-003 journey test
```

## Founder Bias

Every bug is evidence of one of these missing layers:

- effect chain.
- screen contract.
- API contract.
- DB persistence.
- audit.
- downstream effect.
- journey test.
- security/privacy guard.
