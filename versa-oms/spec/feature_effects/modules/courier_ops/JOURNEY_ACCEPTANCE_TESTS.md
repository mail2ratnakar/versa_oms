# Courier Ops — Journey Acceptance Tests

## JRN-037 — Courier Ops: Create dispatch

- Actor: Authorized Staff
- Start screen: Courier Ops - Create dispatch
- API/worker: `POST /courier-ops/dispatches`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Courier Ops - Create dispatch
3. Perform action: Create dispatch
4. Call POST /courier-ops/dispatches
5. Verify validation and server-side authorization
6. Verify server effect: dispatch record created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: dispatch visible
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass

## JRN-038 — Courier Ops: Update tracking

- Actor: Authorized Staff
- Start screen: Courier Ops - Update tracking
- API/worker: `POST /dispatches/{id}/tracking`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Courier Ops - Update tracking
3. Perform action: Update tracking
4. Call POST /dispatches/{id}/tracking
5. Verify validation and server-side authorization
6. Verify server effect: tracking updated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: latest tracking shown
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass

## JRN-039 — Courier Ops: Confirm receipt

- Actor: Authorized Staff
- Start screen: Courier Ops - Confirm receipt
- API/worker: `POST /dispatches/{id}/receipt`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Courier Ops - Confirm receipt
3. Perform action: Confirm receipt
4. Call POST /dispatches/{id}/receipt
5. Verify validation and server-side authorization
6. Verify server effect: receipt and mismatch check created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: receipt status visible
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass

## JRN-040 — Courier Ops: Raise courier incident

- Actor: Authorized Staff
- Start screen: Courier Ops - Raise courier incident
- API/worker: `POST /courier-ops/incidents`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Courier Ops - Raise courier incident
3. Perform action: Raise courier incident
4. Call POST /courier-ops/incidents
5. Verify validation and server-side authorization
6. Verify server effect: incident and task created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: incident visible in queue
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass
