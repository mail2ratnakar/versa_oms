# Roles & Permissions — Journey Acceptance Tests

## JRN-009 — Roles & Permissions: Request role/scope change

- Actor: Authorized Staff
- Start screen: Roles & Permissions - Request role/scope change
- API/worker: `POST /roles-permissions/change-requests`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Roles & Permissions - Request role/scope change
3. Perform action: Request role/scope change
4. Call POST /roles-permissions/change-requests
5. Verify validation and server-side authorization
6. Verify server effect: approval request created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: appears in approval queue
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

## JRN-010 — Roles & Permissions: Approve role/scope change

- Actor: Authorized Staff
- Start screen: Roles & Permissions - Approve role/scope change
- API/worker: `POST /change-requests/{id}/approve`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Roles & Permissions - Approve role/scope change
3. Perform action: Approve role/scope change
4. Call POST /change-requests/{id}/approve
5. Verify validation and server-side authorization
6. Verify server effect: role/scope updated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: permissions change after refresh
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

## JRN-011 — Roles & Permissions: Reject role/scope change

- Actor: Authorized Staff
- Start screen: Roles & Permissions - Reject role/scope change
- API/worker: `POST /change-requests/{id}/reject`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Roles & Permissions - Reject role/scope change
3. Perform action: Reject role/scope change
4. Call POST /change-requests/{id}/reject
5. Verify validation and server-side authorization
6. Verify server effect: request rejected no role mutation
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: rejected state visible
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

## JRN-012 — Roles & Permissions: Run access review

- Actor: Authorized Staff
- Start screen: Roles & Permissions - Run access review
- API/worker: `POST /access-review/run`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Roles & Permissions - Run access review
3. Perform action: Run access review
4. Call POST /access-review/run
5. Verify validation and server-side authorization
6. Verify server effect: review snapshot and findings created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: findings/tasks visible
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
