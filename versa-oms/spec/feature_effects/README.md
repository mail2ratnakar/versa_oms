# Versa Feature Effects + Screen Contracts + Journey Acceptance Pack

Generated at: 2026-06-23T00:00:00+04:00

## Purpose

This pack closes the behavioral wiring gap in the prior specs.

It defines, for every feature:

- source screen
- actor
- user action
- API/worker call
- server-side effect
- downstream effect
- UI result
- audit/task/job/notification expectations
- journey acceptance test

## Metrics

- Modules covered: 19
- Major feature effects: 76
- Screen contracts: 59
- Journey acceptance tests: 76
- Cross-module effect chains: 10

## First journey to implement

`school_crm.convert_to_onboarding`

This must prove:

1. CRM lead becomes converted.
2. School record is created or linked.
3. Onboarding case is created.
4. Onboarding task is assigned.
5. Onboarding queue updates.
6. Dashboard count updates.
7. Audit event is written.
