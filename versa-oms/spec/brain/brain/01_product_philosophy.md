# 01 — Product Philosophy

## Product Principle

Versa is an operational system, not a static admin panel.

Every module exists because it moves work forward.

A feature is useful only if it advances a real operational journey.

## Product Truths

### 1. Every feature has a consequence

If a CRM lead is converted, onboarding must start.

If payment is confirmed, finance gate must open.

If roster is locked, candidate IDs must exist.

If results are published, certificates become eligible.

If a sensitive export is approved, a private file and download audit must exist.

### 2. Every consequence must be visible

A hidden downstream effect is not enough.

Someone must see it:

- staff dashboard.
- module queue.
- school portal.
- task queue.
- audit timeline.
- notification log.
- public verification route.

### 3. Every status transition must be meaningful

Status is not decoration.

Status must control:

- what actions are allowed.
- what screens display.
- what downstream gates open.
- what audit events are required.

### 4. Every high-risk action must be accountable

High-risk action requires:

- reason.
- permission.
- approval where configured.
- no self-approval.
- audit.
- rollback/supersede/revoke path.

### 5. Local demo is not real readiness

Local mode can prove shape and logic.

Staging proves infra.

Production proves reliability, security and operations.

Do not confuse these.

## Product Bias

Build in this order:

```text
journey
↓
effect chain
↓
screen contract
↓
API
↓
DB
↓
audit/security
↓
test
```

Not:

```text
table
↓
route
↓
claim complete
```
