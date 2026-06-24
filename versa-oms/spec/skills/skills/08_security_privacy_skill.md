# 08 — Security Privacy Skill

## Purpose

Applies threat model, privacy matrix, masking and least-privilege controls before completion is claimed.

## Must Read Before Acting

- `threat-models/THREAT_MODEL_OVERVIEW.md`
- `threat-models/THREAT_REGISTER.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `threat-models/SECURITY_TEST_CASES.json`

## Checks

- PII masked
- answer keys restricted
- raw OMR restricted
- provider payload hidden
- support safe summary
- courier no candidate mapping
- public verification minimal
- rate limits
- security/privacy tests

## Failure Signals

- finance sees student PII
- support sees answer key
- public verify leaks score/contact

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
