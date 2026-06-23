# Reports & Exports — Journey Acceptance Tests

## JRN-065 — Reports & Exports: Run safe report

- Actor: Authorized Staff
- Start screen: Reports & Exports - Run safe report
- API/worker: `POST /reports/{id}/run`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Reports & Exports - Run safe report
3. Perform action: Run safe report
4. Call POST /reports/{id}/run
5. Verify validation and server-side authorization
6. Verify server effect: safe report snapshot generated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: report visible
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

## JRN-066 — Reports & Exports: Request sensitive export

- Actor: Authorized Staff
- Start screen: Reports & Exports - Request sensitive export
- API/worker: `POST /exports`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Reports & Exports - Request sensitive export
3. Perform action: Request sensitive export
4. Call POST /exports
5. Verify validation and server-side authorization
6. Verify server effect: export request and approval task created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: export pending approval
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

## JRN-067 — Reports & Exports: Generate approved export

- Actor: System Worker
- Start screen: Reports & Exports - Generate approved export
- API/worker: `worker:export.generate`

### Steps
1. Resolve actor as System Worker
2. Open screen: Reports & Exports - Generate approved export
3. Perform action: Generate approved export
4. Call worker:export.generate
5. Verify validation and server-side authorization
6. Verify server effect: private export file created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: export ready
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

## JRN-068 — Reports & Exports: Download export

- Actor: Authorized Staff
- Start screen: Reports & Exports - Download export
- API/worker: `POST /exports/{id}/download-url`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Reports & Exports - Download export
3. Perform action: Download export
4. Call POST /exports/{id}/download-url
5. Verify validation and server-side authorization
6. Verify server effect: signed URL and download audit created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: download starts
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
