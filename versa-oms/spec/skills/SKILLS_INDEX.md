# Skills Index

Generated at: **2026-06-24T00:00:00+04:00**

## Reading Order

00. [Project Reader Skill](skills/00_project_reader_skill.md) — Reads packs in correct order, builds project map, identifies next pending item and prevents coding before context is loaded.
01. [Spec Interpreter Skill](skills/01_spec_interpreter_skill.md) — Converts source-of-truth specs into tasks and separates nouns, states, actions, effects, screens and tests.
02. [Effect Chain Skill](skills/02_effect_chain_skill.md) — Defines what must happen after every action: database changes, status transition, tasks, jobs, notifications, audit and downstream effects.
03. [Screen Contract Skill](skills/03_screen_contract_skill.md) — Ensures every feature has a real screen contract with route, data, components, states, permissions and action wiring.
04. [Journey Test Skill](skills/04_journey_test_skill.md) — Proves each feature end-to-end from screen action to API, DB state, downstream effect, audit and UI update.
05. [API Contract Skill](skills/05_api_contract_skill.md) — Keeps routes, schemas, envelopes, errors, pagination, filtering, idempotency and public/private routing aligned to API contracts.
06. [Database Migration Skill](skills/06_database_migration_skill.md) — Creates safe additive migrations with real tables, indexes, lifecycle fields, RLS, audit/idempotency/job tables and no destructive changes.
07. [Auth RBAC Scope Skill](skills/07_auth_rbac_scope_skill.md) — Ensures auth, staff/school separation, role/scope resolution and authorization are server-side and production-safe.
08. [Security Privacy Skill](skills/08_security_privacy_skill.md) — Applies threat model, privacy matrix, masking and least-privilege controls before completion is claimed.
09. [Audit Idempotency Skill](skills/09_audit_idempotency_skill.md) — Ensures write/high-risk actions are audit-backed, reasoned, retry-safe and idempotent.
10. [File Storage Signed URL Skill](skills/10_file_storage_signed_url_skill.md) — Ensures sensitive files use private storage, scoped short-lived signed URLs, download audit, expiry and revocation.
11. [Worker Queue Skill](skills/11_worker_queue_skill.md) — Implements long-running work with validated, idempotent, retryable, observable and auditable worker queues.
12. [Observability Skill](skills/12_observability_skill.md) — Makes the app diagnosable using structured logs, redaction, metrics, alerts, health endpoints, traces and release monitoring.
13. [UI Design System Skill](skills/13_ui_design_system_skill.md) — Keeps screens consistent, role-aware, responsive, accessible and aligned to approved components/tokens.
14. [Seed Data Skill](skills/14_seed_data_skill.md) — Ensures demo/staging scenarios are loaded, privacy-safe and usable for journey tests.
15. [CI Deployment Skill](skills/15_ci_deployment_skill.md) — Prevents local-only builds from being mistaken as staging or production complete.
16. [Completion Verification Skill](skills/16_completion_verification_skill.md) — Defines what done means and forces evidence-based completed/pending reporting.
17. [Gap Detection Skill](skills/17_gap_detection_skill.md) — Forces missing layers to be reported instead of silently improvised or hidden.

## Core Rule

Read skills first, then packs, then implement one pending item with tests and evidence.
