# Workflow Status (derived by `_validation/check_workflows.py`)

The dictionary of end-to-end business chains. **Code ONE workflow end-to-end — through every completion gate (ARCH_RUNTIME_CHECKLIST §16 + P0.10 UI) — before starting the next**, picking by the dependency order below. Status is DERIVED from `tests/e2e` (not hand-edited).

| # | Workflow | Status | Modules | e2e (present/total) | Depends on |
|---|---|---|---|---|---|
| 1 | `WF-001` CRM Lead to School Activation | [x] built | 6 | 10/10 | — |
| 2 | `WF-002` School Activation to Roster Lock | [x] built | 5 | 5/5 | WF-001 |
| 3 | `WF-003` Invoice to Finance Gate | [x] built | 4 | 4/4 | WF-001 |
| 4 | `WF-004` Exam Slot Confirmation to Material Readiness | [x] built | 7 | 3/3 | WF-002, WF-003 |
| 5 | `WF-005` Material Generation to Secure School Download | [x] built | 6 | 1/1 | WF-004 |
| 6 | `WF-006` Courier Dispatch to Receipt | [x] built | 5 | 1/1 | WF-005 |
| 7 | `WF-007` Answer Sheets to Score Batch | [x] built | 5 | 3/3 | WF-002, WF-005 |
| 8 | `WF-008` Score Batch to Results Publication | [x] built | 6 | 2/2 | WF-007 |
| 9 | `WF-009` Certificate Generation to Public Verification | [x] built | 5 | 4/4 | WF-008 |
| 10 | `WF-010` Support Ticket to Resolution | [x] built | 4 | 1/1 | WF-001 |
| 11 | `WF-011` Sensitive Export Approval to Download | [x] built | 4 | 1/1 | WF-001 |
| 12 | `WF-012` Role/Scope Change with Maker-Checker | [x] built | 4 | 1/1 | — |
| 13 | `WF-013` Notification Template to Delivery | [x] built | 3 | 2/2 | — |
| 14 | `WF-014` Admin Setting Change Governance | [ ] planned | 3 | 0/0 | — |
| 15 | `WF-015` Security Incident and Audit Drift Review | [ ] planned | 5 | 0/0 | WF-012 |
| 16 | `WF-016` Full Olympiad Operations Happy Path | [x] via-deps | 14 | 0/0 | WF-001, WF-002, WF-003, WF-004, WF-005, WF-006, WF-007, WF-008, WF-009 |

**14/16 workflows built (or covered by built deps).** Next chain to build: `WF-014` Admin Setting Change Governance.

