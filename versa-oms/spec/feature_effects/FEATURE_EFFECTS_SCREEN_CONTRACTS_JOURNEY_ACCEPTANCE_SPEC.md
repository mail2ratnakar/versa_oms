# Feature Effects + Screen Contracts + Journey Acceptance Specification

## Purpose

A feature is not complete because its table, status and route exist.

A feature is complete only when:

1. User can perform it from a screen.
2. API/service applies the effect.
3. Database state changes correctly.
4. Downstream tasks/jobs/notifications are created.
5. The UI updates.
6. Audit is written.
7. A journey test proves the complete path.

## Per-Feature Required Contract

Each feature must define:

- module
- actor
- source screen
- user action
- API or worker
- validation rules
- server effect
- created records
- updated records
- status transition
- audit event
- downstream module effect
- UI success state
- UI error states
- journey acceptance test

## Do Not Mark Complete Unless

- screen contract implemented
- service effect implemented
- downstream effects implemented
- audit written
- sensitive fields masked
- authorization checked server-side
- journey test passes
