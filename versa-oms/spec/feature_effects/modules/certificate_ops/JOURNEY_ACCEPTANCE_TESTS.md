# Certificate Ops — Journey Acceptance Tests

## JRN-049 — Certificate Ops: Generate certificates

- Actor: Authorized Staff
- Start screen: Certificate Ops - Generate certificates
- API/worker: `POST /certificate-ops/generate`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Certificate Ops - Generate certificates
3. Perform action: Generate certificates
4. Call POST /certificate-ops/generate
5. Verify validation and server-side authorization
6. Verify server effect: certificate jobs queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: generation status visible
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

## JRN-050 — Certificate Ops: Publish certificates

- Actor: Authorized Staff
- Start screen: Certificate Ops - Publish certificates
- API/worker: `POST /batches/{id}/publish`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Certificate Ops - Publish certificates
3. Perform action: Publish certificates
4. Call POST /batches/{id}/publish
5. Verify validation and server-side authorization
6. Verify server effect: school download and verification records enabled
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: certificates visible
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

## JRN-051 — Certificate Ops: Revoke certificate

- Actor: Authorized Staff
- Start screen: Certificate Ops - Revoke certificate
- API/worker: `POST /certificates/{id}/revoke`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Certificate Ops - Revoke certificate
3. Perform action: Revoke certificate
4. Call POST /certificates/{id}/revoke
5. Verify validation and server-side authorization
6. Verify server effect: certificate revoked
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: verification shows revoked
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

## JRN-052 — Certificate Ops: Reissue certificate

- Actor: Authorized Staff
- Start screen: Certificate Ops - Reissue certificate
- API/worker: `POST /certificates/{id}/reissue`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Certificate Ops - Reissue certificate
3. Perform action: Reissue certificate
4. Call POST /certificates/{id}/reissue
5. Verify validation and server-side authorization
6. Verify server effect: new certificate version created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: new certificate visible
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
