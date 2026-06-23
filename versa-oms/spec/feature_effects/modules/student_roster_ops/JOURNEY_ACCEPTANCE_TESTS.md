# Student Roster Ops — Journey Acceptance Tests

## JRN-021 — Student Roster Ops: Upload roster

- Actor: Authorized Staff
- Start screen: Student Roster Ops - Upload roster
- API/worker: `POST /student-roster-ops/imports`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Student Roster Ops - Upload roster
3. Perform action: Upload roster
4. Call POST /student-roster-ops/imports
5. Verify validation and server-side authorization
6. Verify server effect: batch created and validation job queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: batch validating
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

## JRN-022 — Student Roster Ops: Validate roster

- Actor: System Worker
- Start screen: Student Roster Ops - Validate roster
- API/worker: `worker:roster.validate`

### Steps
1. Resolve actor as System Worker
2. Open screen: Student Roster Ops - Validate roster
3. Perform action: Validate roster
4. Call worker:roster.validate
5. Verify validation and server-side authorization
6. Verify server effect: errors produced or batch validated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: validation summary visible
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

## JRN-023 — Student Roster Ops: Lock roster and generate candidates

- Actor: Authorized Staff
- Start screen: Student Roster Ops - Lock roster and generate candidates
- API/worker: `POST /{id}/lock`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Student Roster Ops - Lock roster and generate candidates
3. Perform action: Lock roster and generate candidates
4. Call POST /{id}/lock
5. Verify validation and server-side authorization
6. Verify server effect: batch locked and candidate IDs generated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: candidate IDs visible to authorized roles
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

## JRN-024 — Student Roster Ops: Request correction

- Actor: School Coordinator
- Start screen: Student Roster Ops - Request correction
- API/worker: `POST /school/students/{id}/correction-request`

### Steps
1. Resolve actor as School Coordinator
2. Open screen: Student Roster Ops - Request correction
3. Perform action: Request correction
4. Call POST /school/students/{id}/correction-request
5. Verify validation and server-side authorization
6. Verify server effect: correction request and task created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: request pending visible
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
