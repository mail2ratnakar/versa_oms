# 09 — When To Stop And Ask

## Stop Immediately If

- required source spec missing.
- effect chain missing.
- screen contract missing.
- journey test missing.
- high-risk approval rule unclear.
- role/scope rule conflicts.
- destructive migration seems needed.
- production secret required.
- real infra credentials missing.
- public/private route exposure unclear.
- PII/masking rule unclear.
- payment/result/certificate rule unclear.

## Do Not Ask If

The path is already specified in:

- brain.
- skills.
- build order.
- source-of-truth specs.
- ADRs.
- effect catalog.
- screen contracts.
- journey tests.

Proceed with smallest correct slice.

## Stop Report Format

```text
STOPPED:
REASON:
MISSING INPUT:
AFFECTED FEATURE:
RISK:
WHAT I CAN DO SAFELY:
WHAT I NEED FROM USER/INFRA:
```

## Founder Preference

Do not ask broad questions.

Ask only the missing decision or missing credential needed to proceed.
