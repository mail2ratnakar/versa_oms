# Results Ops — Feature Effects

Purpose: Result generation, approval, publication and correction

## FX-045 — generate_results

- Actor: Authorized Staff
- Source screen: Results Ops - Generate result batch
- API/worker: `POST /results-ops/batches`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: result draft and ranking snapshot created
- Audit event: `results_ops.generate_results`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: batch visible as draft
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-045`

## FX-046 — publish_results

- Actor: Authorized Staff
- Source screen: Results Ops - Approve/publish results
- API/worker: `POST /batches/{id}/publish`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: results published and school visibility enabled
- Audit event: `results_ops.publish_results`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: school results update
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-046`

## FX-047 — withhold_result

- Actor: Authorized Staff
- Source screen: Results Ops - Withhold result
- API/worker: `POST /results/{id}/withhold`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: result withheld
- Audit event: `results_ops.withhold_result`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: school/public hidden
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-047`

## FX-048 — correct_result

- Actor: Authorized Staff
- Source screen: Results Ops - Correct published result
- API/worker: `POST /results/{id}/corrections`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: new result version and certificate impact review created
- Audit event: `results_ops.correct_result`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: version history visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-048`
