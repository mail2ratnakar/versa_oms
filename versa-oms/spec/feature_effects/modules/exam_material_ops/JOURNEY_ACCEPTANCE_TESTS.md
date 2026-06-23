# Exam Material Ops — Journey Acceptance Tests

## JRN-033 — Exam Material Ops: Generate material package

- Actor: Authorized Staff
- Start screen: Exam Material Ops - Generate material package
- API/worker: `POST /exam-material-ops/packages`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Exam Material Ops - Generate material package
3. Perform action: Generate material package
4. Call POST /exam-material-ops/packages
5. Verify validation and server-side authorization
6. Verify server effect: package draft and worker job created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: package generating/generated
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

## JRN-034 — Exam Material Ops: Approve material release

- Actor: Authorized Staff
- Start screen: Exam Material Ops - Approve material release
- API/worker: `POST /packages/{id}/approve-release`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Exam Material Ops - Approve material release
3. Perform action: Approve material release
4. Call POST /packages/{id}/approve-release
5. Verify validation and server-side authorization
6. Verify server effect: release approval and window scheduled
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: package approved_for_release
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

## JRN-035 — Exam Material Ops: School downloads material

- Actor: School Coordinator
- Start screen: Exam Material Ops - School downloads material
- API/worker: `POST /school/materials/{id}/download-url`

### Steps
1. Resolve actor as School Coordinator
2. Open screen: Exam Material Ops - School downloads material
3. Perform action: School downloads material
4. Call POST /school/materials/{id}/download-url
5. Verify validation and server-side authorization
6. Verify server effect: short signed URL and download audit created
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

## JRN-036 — Exam Material Ops: Revoke or replace material

- Actor: Authorized Staff
- Start screen: Exam Material Ops - Revoke or replace material
- API/worker: `POST /packages/{id}/revoke`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Exam Material Ops - Revoke or replace material
3. Perform action: Revoke or replace material
4. Call POST /packages/{id}/revoke
5. Verify validation and server-side authorization
6. Verify server effect: package revoked and replacement version maybe created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: old downloads blocked
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
