# Evaluation Ops — Journey Acceptance Tests

## JRN-041 — Evaluation Ops: Create answer key

- Actor: Authorized Staff
- Start screen: Evaluation Ops - Create answer key
- API/worker: `POST /evaluation-ops/answer-keys`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Evaluation Ops - Create answer key
3. Perform action: Create answer key
4. Call POST /evaluation-ops/answer-keys
5. Verify validation and server-side authorization
6. Verify server effect: answer key draft created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: draft visible to authorized roles
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

## JRN-042 — Evaluation Ops: Approve answer key

- Actor: Authorized Staff
- Start screen: Evaluation Ops - Approve answer key
- API/worker: `POST /answer-keys/{id}/approve`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Evaluation Ops - Approve answer key
3. Perform action: Approve answer key
4. Call POST /answer-keys/{id}/approve
5. Verify validation and server-side authorization
6. Verify server effect: answer key approved/version locked
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: available for scoring
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

## JRN-043 — Evaluation Ops: Import OMR/CSV

- Actor: Authorized Staff
- Start screen: Evaluation Ops - Import OMR/CSV
- API/worker: `POST /evaluation-ops/imports`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Evaluation Ops - Import OMR/CSV
3. Perform action: Import OMR/CSV
4. Call POST /evaluation-ops/imports
5. Verify validation and server-side authorization
6. Verify server effect: import batch and validation job queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: import validating
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

## JRN-044 — Evaluation Ops: Generate score batch

- Actor: Authorized Staff
- Start screen: Evaluation Ops - Generate score batch
- API/worker: `POST /imports/{id}/score`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Evaluation Ops - Generate score batch
3. Perform action: Generate score batch
4. Call POST /imports/{id}/score
5. Verify validation and server-side authorization
6. Verify server effect: score batch generated and exceptions flagged
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: score summary visible
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
