# Finance Ops — Journey Acceptance Tests

## JRN-025 — Finance Ops: Generate invoice

- Actor: Authorized Staff
- Start screen: Finance Ops - Generate invoice
- API/worker: `POST /finance-ops/invoices`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Finance Ops - Generate invoice
3. Perform action: Generate invoice
4. Call POST /finance-ops/invoices
5. Verify validation and server-side authorization
6. Verify server effect: server-calculated invoice created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: invoice visible to school
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

## JRN-026 — Finance Ops: Create payment link

- Actor: Authorized Staff
- Start screen: Finance Ops - Create payment link
- API/worker: `POST /invoices/{id}/payment-link`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Finance Ops - Create payment link
3. Perform action: Create payment link
4. Call POST /invoices/{id}/payment-link
5. Verify validation and server-side authorization
6. Verify server effect: payment link created and notification queued
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: pay button visible
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

## JRN-027 — Finance Ops: Confirm manual payment

- Actor: Authorized Staff
- Start screen: Finance Ops - Confirm manual payment
- API/worker: `POST /invoices/{id}/confirm-manual-payment`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Finance Ops - Confirm manual payment
3. Perform action: Confirm manual payment
4. Call POST /invoices/{id}/confirm-manual-payment
5. Verify validation and server-side authorization
6. Verify server effect: payment marked paid after approval and finance gate opens
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: downstream gates unlock
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

## JRN-028 — Finance Ops: Refund/reverse payment

- Actor: Authorized Staff
- Start screen: Finance Ops - Refund/reverse payment
- API/worker: `POST /payments/{id}/refund`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Finance Ops - Refund/reverse payment
3. Perform action: Refund/reverse payment
4. Call POST /payments/{id}/refund
5. Verify validation and server-side authorization
6. Verify server effect: refund request and payment state version created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: refund state visible
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
