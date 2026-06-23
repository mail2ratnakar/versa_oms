# Security & Audit Console — Journey Acceptance Tests

## JRN-073 — Security & Audit Console: View audit timeline

- Actor: Authorized Staff
- Start screen: Security & Audit Console - View audit timeline
- API/worker: `GET /audit-events`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Security & Audit Console - View audit timeline
3. Perform action: View audit timeline
4. Call GET /audit-events
5. Verify validation and server-side authorization
6. Verify server effect: restricted audit view loaded
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: timeline visible
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

## JRN-074 — Security & Audit Console: Create security incident

- Actor: Authorized Staff
- Start screen: Security & Audit Console - Create security incident
- API/worker: `POST /incidents`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Security & Audit Console - Create security incident
3. Perform action: Create security incident
4. Call POST /incidents
5. Verify validation and server-side authorization
6. Verify server effect: incident and tasks created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: incident visible
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

## JRN-075 — Security & Audit Console: Run permission drift scan

- Actor: System Worker
- Start screen: Security & Audit Console - Run permission drift scan
- API/worker: `worker:security.permission_drift_scan`

### Steps
1. Resolve actor as System Worker
2. Open screen: Security & Audit Console - Run permission drift scan
3. Perform action: Run permission drift scan
4. Call worker:security.permission_drift_scan
5. Verify validation and server-side authorization
6. Verify server effect: findings/incidents/tasks created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: security dashboard updates
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

## JRN-076 — Security & Audit Console: Verify audit hashes

- Actor: System Worker
- Start screen: Security & Audit Console - Verify audit hashes
- API/worker: `worker:security.audit_hash_verify`

### Steps
1. Resolve actor as System Worker
2. Open screen: Security & Audit Console - Verify audit hashes
3. Perform action: Verify audit hashes
4. Call worker:security.audit_hash_verify
5. Verify validation and server-side authorization
6. Verify server effect: verification result stored; incident on mismatch
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: audit health panel updates
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
