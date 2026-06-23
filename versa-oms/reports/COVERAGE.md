# Features-Pack Coverage

Pack: 76 FX · 59 SCR · 76 JRN · 10 CHAIN

## Per module

| Module | FX | SCR | JRN | screen-spec | action-spec |
|---|--:|--:|--:|:--:|:--:|
| admin_settings | 4 | 3 | 4 | — | — |
| certificate_ops | 4 | 3 | 4 | — | — |
| company_dashboard | 4 | 2 | 4 | — | — |
| courier_ops | 4 | 3 | 4 | — | — |
| evaluation_ops | 4 | 3 | 4 | — | — |
| exam_material_ops | 4 | 3 | 4 | — | — |
| exam_slot_ops | 4 | 3 | 4 | — | — |
| finance_ops | 4 | 3 | 4 | — | — |
| notification_ops | 4 | 3 | 4 | — | — |
| reports_exports | 4 | 4 | 4 | — | — |
| results_ops | 4 | 3 | 4 | — | — |
| roles_permissions | 4 | 3 | 4 | — | — |
| school_crm | 4 | 4 | 4 | ✅ | ✅ |
| school_onboarding_ops | 4 | 3 | 4 | — | — |
| security_audit_console | 4 | 4 | 4 | — | — |
| staff_users | 4 | 3 | 4 | — | — |
| student_roster_ops | 4 | 3 | 4 | — | — |
| support_tickets | 4 | 3 | 4 | — | — |
| task_work_queue | 4 | 3 | 4 | — | — |

## Cross-module chains

| Chain | Trigger | in effects-spec | has e2e |
|---|---|:--:|:--:|
| CHAIN-001 | school_crm.convert_to_onboarding | — | ✅ |
| CHAIN-002 | school_onboarding_ops.activate_school | ✅ | ✅ |
| CHAIN-003 | student_roster_ops.lock_roster | ✅ | ✅ |
| CHAIN-004 | finance_ops.confirm_manual_payment | ✅ | ✅ |
| CHAIN-005 | exam_slot_ops.confirm_slot | — | — |
| CHAIN-006 | exam_material_ops.approve_release | — | — |
| CHAIN-007 | evaluation_ops.generate_scores | — | — |
| CHAIN-008 | results_ops.publish_results | — | — |
| CHAIN-009 | certificate_ops.publish_certificates | — | — |
| CHAIN-010 | reports_exports.request_sensitive_export | — | — |

## Summary

modules=19 screen-specs=1 action-specs=1 | chains: in-spec=3/10 e2e=4/10
