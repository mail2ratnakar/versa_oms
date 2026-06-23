# Notification Ops — Journey Acceptance Tests

## JRN-053 — Notification Ops: Create template

- Actor: Authorized Staff
- Start screen: Notification Ops - Create template
- API/worker: `POST /notification-ops/templates`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Notification Ops - Create template
3. Perform action: Create template
4. Call POST /notification-ops/templates
5. Verify validation and server-side authorization
6. Verify server effect: template draft created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: template visible
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

## JRN-054 — Notification Ops: Approve bulk notification

- Actor: Authorized Staff
- Start screen: Notification Ops - Approve bulk notification
- API/worker: `POST /batches/{id}/approve`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Notification Ops - Approve bulk notification
3. Perform action: Approve bulk notification
4. Call POST /batches/{id}/approve
5. Verify validation and server-side authorization
6. Verify server effect: batch approved and dispatch job queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: status queued/sending
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

## JRN-055 — Notification Ops: Dispatch notification batch

- Actor: System Worker
- Start screen: Notification Ops - Dispatch notification batch
- API/worker: `worker:notification.dispatch_batch`

### Steps
1. Resolve actor as System Worker
2. Open screen: Notification Ops - Dispatch notification batch
3. Perform action: Dispatch notification batch
4. Call worker:notification.dispatch_batch
5. Verify validation and server-side authorization
6. Verify server effect: delivery attempts stored
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: delivery summary visible
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

## JRN-056 — Notification Ops: Process failure/opt-out

- Actor: Authorized Staff
- Start screen: Notification Ops - Process failure/opt-out
- API/worker: `POST /deliveries/{id}/status`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Notification Ops - Process failure/opt-out
3. Perform action: Process failure/opt-out
4. Call POST /deliveries/{id}/status
5. Verify validation and server-side authorization
6. Verify server effect: delivery/opt-out state updated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: future sends respect consent
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
