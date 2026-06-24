# Versa OMS — Build Principles (the dictionary)

The frozen checklist to run **before building anything**. Derived from this project's own
specs, kernel, policies and migrations — not generic advice. Companion to `WORKFLOW_CHECKLIST.md`
(process) and `SPEC_DRIVEN_METHOD.md` (pipeline). When a principle and a clear spec conflict,
the spec wins and the principle is updated.

## How to use
1. Pick the categories that touch your change.
2. **Apply each principle to EVERY element** (every field, column, action, transition) — never just the salient ones.
3. **Show the per-element pass to the user before coding** (a field→control→verdict table). Catch gaps in review, not after build.

---

## 0. Meta (how to think — these govern the rest)
- **P0.1 Exhaustive pass.** Enumerate every element and apply the governing principle to each. Reactive building (handling only what's named) is the #1 drift.
- **P0.2 Consistency across siblings.** If one member of a class gets a treatment, all do — if `country` is a dropdown, `state` and `board` must be too.
- **P0.3 Clarity is a standard to meet, not a license to skip.** When the spec/common sense is obvious, that's exactly when to be uniform.
- **P0.4 Show your reasoning before you build.** Present the per-element analysis so it can be vetoed/extended pre-code.
- **P0.5 Use existing schema; don't invent.** Reuse enums/patterns that already exist (e.g. `schools.board`); avoid needless migrations/new enums.

## 1. UI / UX
- **P1.1 Input control matches the field's real-world domain.** Finite set → dropdown (country/state/board/source/grade/status/type); email → email input; phone → tel; quantity → number; date → date; open/arbitrary → text. (ModuleTable FieldInput)
- **P1.2 Labels are human + Title Case**, never raw `snake_case`; render enum values with spaces. (gen_ui.titleize)
- **P1.3 Required fields first, with sensible defaults.** Group required at top; pre-fill obvious defaults (Country=India). Keep capture modals lean (required + 2–3 key recommended; rest goes to detail/edit).
- **P1.4 Field sufficiency is judged against the field policy**, not guesswork — `*_field_policy.json` lists `required_fields_mvp` vs `recommended_fields`. Required-MVP fields must be collected (never silently DB-defaulted).
- **P1.5 Status as colored chips** — green (approved/paid/active/done), yellow (pending/draft/review), red (rejected/failed/lost), blue (default).
- **P1.6 Branded confirm dialog for irreversible/destructive actions**, with plain-language (layman) copy: what happens + a "can't be undone" warning. No raw technical jargon to users.
- **P1.7 Actions gate on lifecycle from-state.** Only show/allow an action valid from the row's current status; lock terminal states.
- **P1.8 Reason required only for irreversible actions** (approve/reject/revoke/withhold/cancel); optional otherwise. Show record summary + "Why?" in the action modal.
- **P1.9 PII renders masked** in lists/details (e.g. phone last-4); never show full sensitive values to roles without unmask rights.
- **P1.10 Every page is reachable from nav.** No orphaned routes; secondary entities nest under their parent. Generate nav, don't hand-maintain drift.
- **P1.11 Button intent by variant** — primary/create = dark, affirmative/revenue = blue, secondary/cancel = light. Disable during async ("Working…").
- **P1.12 Both portals.** A page that exists for staff often needs a school-scoped counterpart (and vice-versa) — see P3.1.

## 2. Data model & fields
- **P2.1 The canonical model is the source of truth** (`implementation/CANONICAL_DATA_MODEL.json`), NOT `spec/modules/*/schema.json` collections (which carry merged/dropped fields). Read column names/types/nullability from canonical or the live DB.
- **P2.2 Finite real-world domains are enums** with explicit `allowed_values` — never free text for stage/status/type/board/grade/source.
- **P2.3 Status/stage is server-controlled.** Set initial status server-side; transitions are computed by business rules; never trust client status.
- **P2.4 NOT-NULL business codes are server-generated** as `PREFIX-XXXXXXXX` (codeColumn/codePrefix) — never client input. Enforce format at the app layer (no CHECK migration).
- **P2.5 `created_at`/`updated_at` DEFAULT now()** in every table — never required on insert (the kernel doesn't set them).
- **P2.6 Action timestamps (`booked_at`, `opened_at`, `downloaded_at`, …) are nullable** — set when the action occurs, not on generic create. Domain range dates (`*_start/end/open/close_at`) stay required.
- **P2.7 Actor columns (`*_by`) are nullable** — system/seed/automated actions have no actor.
- **P2.8 Conditional fields are nullable** (`*_reason`, `*_note`, `*_evidence`, optional FKs, file refs); enforce "required when state X" in business logic/validations, not as a blanket NOT NULL.
- **P2.9 Normalization fields are system-computed** (`normalized_*`) from the user field; not user-editable; used for dedupe.
- **P2.10 Classify every field** (`data_classification.json`): public / internal / sensitive (PII → masked) / restricted (audit-only) / never_log (secrets — never in audit payloads).
- **P2.11 Append-only tables** (audit/events/history) are never updated/deleted — only a controlled status/review flag changes.
- **P2.12 Reference parents by FK** (school_id, participation_id); derive details on read — don't denormalize parent fields into children.
- **P2.13 Run `check_schema_drift.py` before building a new entity** — catch the conditional-NOT-NULL / timestamp classes before e2e does. New ones join the consolidating migration, not a one-off.

## 3. Workflow / lifecycle / security
- **P3.1 Both-sides rule.** A transition's `actor` decides which portal owns it (staff / school / system). Read BOTH modules' workflows/security/policies; build the action on the owning side; build the counterpart view if the other side needs it.
- **P3.2 Guards are fail-closed preconditions.** Check before applying; if a guard can't be evaluated, BLOCK (don't silently skip). Generated from `guard_checks.json`; declared-but-unmapped guards are tracked enforcement gaps.
- **P3.3 Respect from-state.** A transition is only valid from its declared `from` statuses (`isActionAllowedFrom`).
- **P3.4 Dual-approval (maker≠checker) for high-risk actions.** Two distinct approvers before apply; return `applied:false` until threshold met.
- **P3.5 Every state-changing action writes an append-only audit event** (actor + role snapshot, prev/new status, reason, request_id). Sensitive reads audit too.
- **P3.6 No hard delete.** Soft-delete via `archived_at`; lists filter it out.
- **P3.7 Idempotency keys on create/transition/approval** (`X-Idempotency-Key`); same key+payload replays, different payload conflicts.
- **P3.8 School scope is server-enforced.** Set `school_id` from the actor on create; filter lists by the actor's school; never trust browser school_id. Staff scope narrows to assigned schools/regions/olympiads/queues.
- **P3.9 Reject forbidden/system fields from client payloads** (`created_by`, status, etc.). `reason` is audit-only and stripped on create/update unless the table has a real `reason` column (`reasonIsColumn`).
- **P3.10 Three kernel layers, in order:** preconditions (block) → guards (valid-from-status) → effects (cross-module, after apply). Effects are declared in `chains.json`, never hand-coded.
- **P3.11 Domain policies are binding.** `*_policy.json` (conversion/duplicate/assignment/followup/…) are rules, not docs — e.g. block conversion when `duplicate_status = confirmed_duplicate`.

## 4. Spec-driven method
- **P4.1 Never hand-edit generated output.** Pages/services/routes/effects/guards/nav carry `// GENERATED … DO NOT EDIT`. Change the SPEC and regenerate.
- **P4.2 Every change is a CR.** Write `FR-<MODULE>-<YEAR>-<NNNN>.json` in the module's `feature_requests/`, edit the spec, regenerate, verify, commit together.
- **P4.3 Run the auditors first** — `check_schema_drift.py` + `audit_modules.py` before building; `check_generated.py` (drift guardrail) before commit.
- **P4.4 Verify every build:** tsc + vitest + a JRN e2e for the action (positive + a fail-closed negative) + auditor reflects it.
- **P4.5 `created_local` in a response = silent DB-insert failure** that fell back to a local echo — a tell for a kernel/schema mismatch; investigate, don't ship.
