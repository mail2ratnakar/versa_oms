# Test Registry (PRINCIPLES P4.7)

The reference index of every unit test, and the source for the **smoke-test stage**.
Update this file in the same CR that adds/changes tests. Run all: `cd versa-oms/app && npx vitest run`.

- **Smoke** = part of the fast pre-deploy gate (auth/scope/masking, envelopes, kernel create/transition, dual-approval, and each shipped feature's headline path).
- Counts are `it()` blocks per file. Totals: **20 files / 126 tests** (as of 2026-06-24).

Smoke subset (run these for a quick gate):
`vitest run tests/unit/{foundation,scope,crm_scope,security,dual_approval,transitions,contract,crm_interactions,crm_import,crm_dedupe}.test.ts`

| File | # | Covers (describe groups) | Smoke |
|---|---|---|---|
| foundation.test.ts | 14 | http envelope · permission engine · field masking | ✅ |
| scope.test.ts | 5 | staff assignment-scope | ✅ |
| crm_scope.test.ts | 10 | FR-0006 recordInScope · service A01 IDOR enforcement | ✅ |
| security.test.ts | 4 | forbidden PII fields rejected · self role-change blocked | ✅ |
| dual_approval.test.ts | 3 | dual-approval (maker≠checker) | ✅ |
| transitions.test.ts | 4 | spec-derived status transitions | ✅ |
| contract.test.ts | 3 | API contract: standard envelopes | ✅ |
| modules.test.ts | 6 | generated modules register policies · kernel validation/create | ✅ |
| privacy.test.ts | 2 | log redaction · public verification leaks nothing private | ✅ |
| crm_interactions.test.ts | 11 | FR-0004 Comms: canonical write · OWASP · concurrency | ✅ |
| crm_interactions_followup.test.ts | 11 | FR-0005 follow-up automation · edit-with-reason · OWASP · concurrency | ✅ |
| crm_import.test.ts | 16 | FR-0007/0008 staged import: validate/commit/cancel · dual-approval · OWASP · concurrency | ✅ |
| crm_dedupe.test.ts | 8 | FR-0010 findDuplicates parity (email/phone/website/name-key) + O(n) perf at 20k | ✅ |
| computation.test.ts | 7 | OMR scoring · ranking · certificate verification · result immutability/versioning | — |
| generation.test.ts | 5 | notification delivery · export (CSV+watermark) · finance computation | — |
| workflow.test.ts | 4 | CRM duplicate detection · auto-task from workflow events · courier reconciliation | ✅ |
| jobs.test.ts | 4 | worker job runner | — |
| payments.test.ts | 3 | payment webhook signature | ✅ |
| school.test.ts | 3 | school portal services (school-scoped) | ✅ |
| candidate_id.test.ts | 3 | candidate-ID generation | — |
