# ABUSE_CASES.md

## Abuse Case 1 — Staff tries to self-promote

- Actor: authenticated staff user.
- Goal: add admin role to self.
- Expected defense:
  - self role change blocked.
  - maker-checker required.
  - audit event created.
  - security alert if suspicious.

## Abuse Case 2 — School changes school_id in browser request

- Actor: school coordinator.
- Goal: access another school's roster/results.
- Expected defense:
  - server ignores browser school_id.
  - school_id resolved from session.
  - access denied/not found.
  - audit/security event recorded where suspicious.

## Abuse Case 3 — Payment status forged

- Actor: school or malicious client.
- Goal: mark invoice as paid.
- Expected defense:
  - server-calculated payment state.
  - gateway signature or finance approval required.
  - forged status ignored.

## Abuse Case 4 — Question paper URL shared

- Actor: school user or external party.
- Goal: reuse material download URL.
- Expected defense:
  - short-lived signed URL.
  - school-scoped access.
  - revoked material blocks download.
  - download audit.

## Abuse Case 5 — Sensitive export requested

- Actor: staff user.
- Goal: export student/parent data.
- Expected defense:
  - reason required.
  - approval required.
  - masking by default.
  - download signed and audited.
  - export expires.

## Abuse Case 6 — Public verification enumeration

- Actor: bot/public user.
- Goal: enumerate valid certificates.
- Expected defense:
  - unguessable codes.
  - no broad search.
  - rate limiting.
  - generic not-found shape.
  - anomaly alert.
