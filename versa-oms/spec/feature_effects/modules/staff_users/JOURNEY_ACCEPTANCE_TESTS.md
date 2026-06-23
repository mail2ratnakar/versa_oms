# Staff Users — Journey Acceptance Tests

## JRN-005 — Staff Users: Invite staff user

- Actor: Authorized Staff
- Start screen: Staff Users - Invite staff user
- API/worker: `POST /staff-users/invitations`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Staff Users - Invite staff user
3. Perform action: Invite staff user
4. Call POST /staff-users/invitations
5. Verify validation and server-side authorization
6. Verify server effect: invitation created and notification queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: pending invite visible
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

## JRN-006 — Staff Users: Accept staff invite

- Actor: Authorized Staff
- Start screen: Staff Users - Accept staff invite
- API/worker: `POST /invite/accept`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Staff Users - Accept staff invite
3. Perform action: Accept staff invite
4. Call POST /invite/accept
5. Verify validation and server-side authorization
6. Verify server effect: staff activated and invite consumed
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: staff can access allowed routes
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

## JRN-007 — Staff Users: Disable staff user

- Actor: Authorized Staff
- Start screen: Staff Users - Disable staff user
- API/worker: `POST /staff-users/{id}/disable`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Staff Users - Disable staff user
3. Perform action: Disable staff user
4. Call POST /staff-users/{id}/disable
5. Verify validation and server-side authorization
6. Verify server effect: staff disabled and sessions revoked
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: access blocked
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

## JRN-008 — Staff Users: Revoke staff sessions

- Actor: Authorized Staff
- Start screen: Staff Users - Revoke staff sessions
- API/worker: `POST /staff-users/{id}/revoke-sessions`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Staff Users - Revoke staff sessions
3. Perform action: Revoke staff sessions
4. Call POST /staff-users/{id}/revoke-sessions
5. Verify validation and server-side authorization
6. Verify server effect: sessions invalidated
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: user must login again
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
