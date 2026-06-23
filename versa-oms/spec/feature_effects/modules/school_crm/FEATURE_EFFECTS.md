# School CRM — Feature Effects

Purpose: School lead and conversion pipeline

## FX-013 — create_lead

- Actor: Authorized Staff
- Source screen: School CRM - Create school lead
- API/worker: `POST /school-crm/leads`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: lead created stage=new_lead
- Audit event: `school_crm.create_lead`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: lead appears in CRM
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-013`

## FX-014 — move_stage

- Actor: Authorized Staff
- Source screen: School CRM - Move lead stage
- API/worker: `POST /leads/{id}/stage`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: lead stage changed and follow-up task maybe created
- Audit event: `school_crm.move_stage`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: pipeline/list updates
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-014`

## FX-015 — convert_to_onboarding

- Actor: Authorized Staff
- Source screen: School CRM - Convert lead to onboarding
- API/worker: `POST /leads/{id}/convert`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: school created/linked, onboarding case and task created
- Audit event: `school_crm.convert_to_onboarding`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: school appears in onboarding queue
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-015`

## FX-016 — mark_lost

- Actor: Authorized Staff
- Source screen: School CRM - Mark lead lost
- API/worker: `POST /leads/{id}/lost`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: lead stage=lost with reason
- Audit event: `school_crm.mark_lost`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: lost filter updates
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-016`
