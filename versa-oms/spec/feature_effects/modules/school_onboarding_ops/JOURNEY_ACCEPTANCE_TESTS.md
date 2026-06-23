# School Onboarding Ops — Journey Acceptance Tests

## JRN-017 — School Onboarding Ops: Open onboarding case

- Actor: Authorized Staff
- Start screen: School Onboarding Ops - Open onboarding case
- API/worker: `GET /school-onboarding-ops/{id}`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School Onboarding Ops - Open onboarding case
3. Perform action: Open onboarding case
4. Call GET /school-onboarding-ops/{id}
5. Verify validation and server-side authorization
6. Verify server effect: no mutation; checklist loaded
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: case detail visible
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

## JRN-018 — School Onboarding Ops: Request more information

- Actor: Authorized Staff
- Start screen: School Onboarding Ops - Request more information
- API/worker: `POST /{id}/request-info`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School Onboarding Ops - Request more information
3. Perform action: Request more information
4. Call POST /{id}/request-info
5. Verify validation and server-side authorization
6. Verify server effect: case needs_more_info and school notification queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: school sees missing fields
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

## JRN-019 — School Onboarding Ops: Approve school

- Actor: Authorized Staff
- Start screen: School Onboarding Ops - Approve school
- API/worker: `POST /{id}/approve`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School Onboarding Ops - Approve school
3. Perform action: Approve school
4. Call POST /{id}/approve
5. Verify validation and server-side authorization
6. Verify server effect: case approved and school approved
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: activation task visible
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

## JRN-020 — School Onboarding Ops: Activate school

- Actor: Authorized Staff
- Start screen: School Onboarding Ops - Activate school
- API/worker: `POST /{id}/activate`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School Onboarding Ops - Activate school
3. Perform action: Activate school
4. Call POST /{id}/activate
5. Verify validation and server-side authorization
6. Verify server effect: school active and portal enabled
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: school can login/upload roster
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
