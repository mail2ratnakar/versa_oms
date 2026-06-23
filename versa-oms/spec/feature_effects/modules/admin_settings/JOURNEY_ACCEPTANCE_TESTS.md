# Admin Settings — Journey Acceptance Tests

## JRN-069 — Admin Settings: Update feature flag

- Actor: Authorized Staff
- Start screen: Admin Settings - Update feature flag
- API/worker: `POST /feature-flags/{key}`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Admin Settings - Update feature flag
3. Perform action: Update feature flag
4. Call POST /feature-flags/{key}
5. Verify validation and server-side authorization
6. Verify server effect: flag change request or update created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: flag state visible
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

## JRN-070 — Admin Settings: Update policy threshold

- Actor: Authorized Staff
- Start screen: Admin Settings - Update policy threshold
- API/worker: `POST /policies/{id}`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Admin Settings - Update policy threshold
3. Perform action: Update policy threshold
4. Call POST /policies/{id}
5. Verify validation and server-side authorization
6. Verify server effect: new policy version created
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

## JRN-071 — Admin Settings: Configure provider

- Actor: Authorized Staff
- Start screen: Admin Settings - Configure provider
- API/worker: `POST /providers/{id}`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Admin Settings - Configure provider
3. Perform action: Configure provider
4. Call POST /providers/{id}
5. Verify validation and server-side authorization
6. Verify server effect: provider config updated without exposing secret
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: health check visible
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

## JRN-072 — Admin Settings: Run settings review

- Actor: Authorized Staff
- Start screen: Admin Settings - Run settings review
- API/worker: `POST /review/run`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Admin Settings - Run settings review
3. Perform action: Run settings review
4. Call POST /review/run
5. Verify validation and server-side authorization
6. Verify server effect: review findings and tasks created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: findings visible
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
