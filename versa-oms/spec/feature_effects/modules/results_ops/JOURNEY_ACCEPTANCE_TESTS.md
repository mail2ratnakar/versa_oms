# Results Ops — Journey Acceptance Tests

## JRN-045 — Results Ops: Generate result batch

- Actor: Authorized Staff
- Start screen: Results Ops - Generate result batch
- API/worker: `POST /results-ops/batches`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Results Ops - Generate result batch
3. Perform action: Generate result batch
4. Call POST /results-ops/batches
5. Verify validation and server-side authorization
6. Verify server effect: result draft and ranking snapshot created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: batch visible as draft
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

## JRN-046 — Results Ops: Approve/publish results

- Actor: Authorized Staff
- Start screen: Results Ops - Approve/publish results
- API/worker: `POST /batches/{id}/publish`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Results Ops - Approve/publish results
3. Perform action: Approve/publish results
4. Call POST /batches/{id}/publish
5. Verify validation and server-side authorization
6. Verify server effect: results published and school visibility enabled
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: school results update
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

## JRN-047 — Results Ops: Withhold result

- Actor: Authorized Staff
- Start screen: Results Ops - Withhold result
- API/worker: `POST /results/{id}/withhold`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Results Ops - Withhold result
3. Perform action: Withhold result
4. Call POST /results/{id}/withhold
5. Verify validation and server-side authorization
6. Verify server effect: result withheld
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: school/public hidden
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

## JRN-048 — Results Ops: Correct published result

- Actor: Authorized Staff
- Start screen: Results Ops - Correct published result
- API/worker: `POST /results/{id}/corrections`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Results Ops - Correct published result
3. Perform action: Correct published result
4. Call POST /results/{id}/corrections
5. Verify validation and server-side authorization
6. Verify server effect: new result version and certificate impact review created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: version history visible
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
