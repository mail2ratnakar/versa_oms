# Build Runbook for Codex / Claude Code

Use this runbook sequentially. Do not treat this as permission to bypass review gates.

## 19.001 — read_inputs

**Instruction:** Load sections 00-20 CSV files and preserve row IDs, modules and review_required flags.

**Build check:** Runbook step 1: Load sections 00-20 CSV files and preserve row IDs, modules and review_required flags.

**Test/control:** Control/check: No coding yet; produce understanding summary.

## 19.002 — generate_spec_tree

**Instruction:** Create /spec/core, /spec/modules, /spec/security, /spec/changes, /spec/tests, /spec/runbooks.

**Build check:** Runbook step 2: Create /spec/core, /spec/modules, /spec/security, /spec/changes, /spec/tests, /spec/runbooks.

**Test/control:** Control/check: Do not overwrite existing spec files without diff.

## 19.003 — create_project_manifest

**Instruction:** Generate /spec/core/project.json with identity, scope, stack, versioning, modularity and security baseline references.

**Build check:** Runbook step 3: Generate /spec/core/project.json with identity, scope, stack, versioning, modularity and security baseline references.

**Test/control:** Control/check: Validate JSON against schema.

## 19.004 — create_domain_dictionary

**Instruction:** Generate /spec/core/dictionary.json from section 04 terms and section 13 document terms.

**Build check:** Runbook step 4: Generate /spec/core/dictionary.json from section 04 terms and section 13 document terms.

**Test/control:** Control/check: Use canonical names consistently.

## 19.005 — create_actor_role_specs

**Instruction:** Generate actors.json, roles.json, permissions.json and access_matrix.json.

**Build check:** Runbook step 5: Generate actors.json, roles.json, permissions.json and access_matrix.json.

**Test/control:** Control/check: Use deny-by-default and school_id isolation.

## 19.006 — create_module_manifests

**Instruction:** For each module create module.json with module_id, version, owner, dependencies, provides, status and change_policy.

**Build check:** Runbook step 6: For each module create module.json with module_id, version, owner, dependencies, provides, status and change_policy.

**Test/control:** Control/check: Use version 1.0.0 for MVP modules.

## 19.007 — create_directus_schema_plan

**Instruction:** Translate schema rows into Directus collections, fields, relationships and enums.

**Build check:** Runbook step 7: Translate schema rows into Directus collections, fields, relationships and enums.

**Test/control:** Control/check: Produce dry-run schema diff before applying.

## 19.008 — apply_directus_schema

**Instruction:** Use Directus MCP dedicated builder account to create collections/fields/relationships.

**Build check:** Runbook step 8: Use Directus MCP dedicated builder account to create collections/fields/relationships.

**Test/control:** Control/check: Do not delete existing fields unless explicitly approved.

## 19.009 — apply_roles_permissions

**Instruction:** Create Directus roles, item-level filters, field restrictions and public role restrictions.

**Build check:** Runbook step 9: Create Directus roles, item-level filters, field restrictions and public role restrictions.

**Test/control:** Control/check: Test public role and school coordinator isolation immediately.

## 19.010 — scaffold_nextjs

**Instruction:** Create Next.js TypeScript app with Tailwind, shadcn/ui, app router, env config and route groups.

**Build check:** Runbook step 10: Create Next.js TypeScript app with Tailwind, shadcn/ui, app router, env config and route groups.

**Test/control:** Control/check: Keep API secrets server-side only.

## 19.011 — create_api_proxy_layer

**Instruction:** Create server-side routes/actions for auth, school, students, payments, slots, materials, courier, OMR, results, certificates.

**Build check:** Runbook step 11: Create server-side routes/actions for auth, school, students, payments, slots, materials, courier, OMR, results, certificates.

**Test/control:** Control/check: All actions derive role/scope from session.

## 19.012 — build_school_portal

**Instruction:** Implement login, dashboard, registration, upload, payment, slot, materials, courier, results and certificates pages.

**Build check:** Runbook step 12: Implement login, dashboard, registration, upload, payment, slot, materials, courier, results and certificates pages.

**Test/control:** Control/check: Use status-driven next actions.

## 19.013 — build_staff_portal

**Instruction:** Implement staff dashboard, schools, payments, slots, materials, courier, OMR import, results and certificates management pages.

**Build check:** Runbook step 13: Implement staff dashboard, schools, payments, slots, materials, courier, OMR import, results and certificates management pages.

**Test/control:** Control/check: Protect by staff roles.

## 19.014 — implement_files

**Instruction:** Private uploads/downloads through server-side routes with audit and file type/size validation.

**Build check:** Runbook step 14: Private uploads/downloads through server-side routes with audit and file type/size validation.

**Test/control:** Control/check: Never expose raw private file URLs.

## 19.015 — implement_notifications

**Instruction:** Create templates and notification utility; mock email provider until configured.

**Build check:** Runbook step 15: Create templates and notification utility; mock email provider until configured.

**Test/control:** Control/check: Do not attach sensitive files in emails.

## 19.016 — implement_payments

**Instruction:** Create Razorpay payment link service and webhook handler with signature/idempotency; allow mocked mode first.

**Build check:** Runbook step 16: Create Razorpay payment link service and webhook handler with signature/idempotency; allow mocked mode first.

**Test/control:** Control/check: Use env vars only; no secrets in repo.

## 19.017 — implement_certificates

**Instruction:** Create certificate records and verification codes; PDF generation can be mocked until provider selected.

**Build check:** Runbook step 17: Create certificate records and verification codes; PDF generation can be mocked until provider selected.

**Test/control:** Control/check: Public verification returns whitelist only.

## 19.018 — create_tests

**Instruction:** Generate unit, API, permission, UI/E2E and security tests from section 18.

**Build check:** Runbook step 18: Generate unit, API, permission, UI/E2E and security tests from section 18.

**Test/control:** Control/check: Run tests after each module.

## 19.019 — run_build

**Instruction:** Run lint, typecheck, build and tests.

**Build check:** Runbook step 19: Run lint, typecheck, build and tests.

**Test/control:** Control/check: If failures occur, fix within current module scope.

## 19.020 — repair_loop

**Instruction:** On failure, inspect error, patch minimally, rerun relevant test; stop after two failed repair attempts and produce issue summary.

**Build check:** Runbook step 20: On failure, inspect error, patch minimally, rerun relevant test; stop after two failed repair attempts and produce issue summary.

**Test/control:** Control/check: No infinite loop.

## 19.021 — commit_by_module

**Instruction:** Commit changes module by module with clear messages and generated release notes.

**Build check:** Runbook step 21: Commit changes module by module with clear messages and generated release notes.

**Test/control:** Control/check: Do not mix schema/security/payment changes in one opaque commit.

## 19.022 — generate_release_notes

**Instruction:** Create /spec/changes/release_notes.md describing modules created, tests passed, open risks and manual review items.

**Build check:** Runbook step 22: Create /spec/changes/release_notes.md describing modules created, tests passed, open risks and manual review items.

**Test/control:** Control/check: Include unresolved assumptions.

## 19.023 — final_readiness_report

**Instruction:** Produce build_report.md listing implemented modules, environment variables, test results, deployment checklist and next manual decisions.

**Build check:** Runbook step 23: Produce build_report.md listing implemented modules, environment variables, test results, deployment checklist and next manual decisions.

**Test/control:** Control/check: Do not claim production ready unless all go-live checks pass.

## 19.024 — no_blind_overwrite

**Instruction:** Codex must not blindly overwrite existing app/spec files; it must inspect, diff and patch.

**Build check:** Implement guardrail in codex_runbook.md: Codex must not blindly overwrite existing app/spec files; it must inspect, diff and patch.

**Test/control:** Review runbook contains guardrail no_blind_overwrite.

## 19.025 — no_unapproved_delete

**Instruction:** Codex must not delete collections, fields, permissions or files without explicit approval.

**Build check:** Implement guardrail in codex_runbook.md: Codex must not delete collections, fields, permissions or files without explicit approval.

**Test/control:** Review runbook contains guardrail no_unapproved_delete.

## 19.026 — schema_first

**Instruction:** Codex must build schema/security before complex UI screens.

**Build check:** Implement guardrail in codex_runbook.md: Codex must build schema/security before complex UI screens.

**Test/control:** Review runbook contains guardrail schema_first.

## 19.027 — server_side_secrets

**Instruction:** Codex must keep Directus/Razorpay/email secrets server-side only.

**Build check:** Implement guardrail in codex_runbook.md: Codex must keep Directus/Razorpay/email secrets server-side only.

**Test/control:** Review runbook contains guardrail server_side_secrets.

## 19.028 — tests_before_done

**Instruction:** Codex must not mark module complete until relevant tests pass or failure is documented.

**Build check:** Implement guardrail in codex_runbook.md: Codex must not mark module complete until relevant tests pass or failure is documented.

**Test/control:** Review runbook contains guardrail tests_before_done.

## 19.029 — security_stop_condition

**Instruction:** Codex must stop and report if school isolation, auth or file access tests fail twice.

**Build check:** Implement guardrail in codex_runbook.md: Codex must stop and report if school isolation, auth or file access tests fail twice.

**Test/control:** Review runbook contains guardrail security_stop_condition.

## 19.030 — payment_stop_condition

**Instruction:** Codex must stop and report if payment webhook verification/idempotency cannot be implemented/tested.

**Build check:** Implement guardrail in codex_runbook.md: Codex must stop and report if payment webhook verification/idempotency cannot be implemented/tested.

**Test/control:** Review runbook contains guardrail payment_stop_condition.

## 19.031 — public_endpoint_stop_condition

**Instruction:** Codex must stop and report if any public route exposes private fields/files.

**Build check:** Implement guardrail in codex_runbook.md: Codex must stop and report if any public route exposes private fields/files.

**Test/control:** Review runbook contains guardrail public_endpoint_stop_condition.

## 19.032 — manual_review_list

**Instruction:** Codex must maintain review_required rows as a manual review checklist.

**Build check:** Implement guardrail in codex_runbook.md: Codex must maintain review_required rows as a manual review checklist.

**Test/control:** Review runbook contains guardrail manual_review_list.

## 19.033 — autopilot_boundary

**Instruction:** Autopilot may scaffold and test MVP, but production launch requires human approval.

**Build check:** Implement guardrail in codex_runbook.md: Autopilot may scaffold and test MVP, but production launch requires human approval.

**Test/control:** Review runbook contains guardrail autopilot_boundary.
