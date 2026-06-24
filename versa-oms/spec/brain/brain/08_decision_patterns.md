# 08 — Decision Patterns

## Pattern 1 — Should I Code?

Code only if:

- brain read.
- skills read.
- relevant specs read.
- effect chain exists.
- screen contract exists.
- journey test exists.
- no high-risk ambiguity.

If not, stop and report gap.

## Pattern 2 — Which Feature Next?

Choose next work by:

1. latest completed/pending summary (reports/BUILD_STATUS.md).
2. build order.
3. dependency order.
4. highest blocking journey.
5. smallest correct slice.

## Pattern 3 — Bug Fix Or Spec Gap?

If bug is caused by missing expected behavior, treat it as a spec/effect/journey gap first.

Then update spec/test and code.

## Pattern 4 — Local vs Staging

If using:

- demo headers.
- memory DB.
- local placeholder keys.
- fake signed URL.
- no CI.

Then status is local-functional at best.

## Pattern 5 — High Risk

If action touches:

- role/permission.
- payment.
- material release.
- answer key.
- OMR.
- results.
- certificates.
- sensitive exports.
- public verification.
- admin/security settings.

Then require high-risk checks before coding.

## Pattern 6 — Downstream Effects

When status changes, inspect cross-module effect chains before coding.
