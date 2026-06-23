# Versa OMS — Session 1 Validation Report

Generated: 2026-06-22. Scope: validate spec/plan consistency, reconcile the two spec
tracks, evaluate against the user's "Vibe Coding Flow" intent doc, and produce a clean
single working tree. **No spec content was rewritten** — content-level fixes are proposed
here for approval.

---

## 1. What was done

- Extracted all **46 zip packs** → `_staging/` (2000 files), originals untouched.
- Built a unified tree **`versa-oms/`** (1562 files) — dropped ~440 redundant files
  (45 duplicate `PACKAGE_MANIFEST.*`, per-pack `reports/`, `__pycache__`, duplicate READMEs).
- Picked **one canonical source per module** (30 modules, all present), recorded in
  `reports/MODULE_SOURCES.json`; every copied file traced in `reports/PROVENANCE.json`.

## 2. Tree layout (`versa-oms/`)

```
build/            control plane: BUILD_PLAN, AUTOPILOT, BUILD_ORDER, IMPLEMENTATION_MANIFEST,
                  ROLLBACK_PLAN, SECURITY/PRIVACY baselines, MODULE_BUILD_TICKETS, ACCEPTANCE_CRITERIA
implementation/   MASTER_DATA_MODEL, DATABASE_SCHEMA_REGISTRY, RLS_POLICY_MATRIX,
                  FIELD_MASKING_MATRIX, HIGH_RISK_ACTIONS, FEATURE_FLAGS, TEST_STRATEGY, WORKER_JOB_PLAN
api-contract/     openapi.json/yaml + naming/pagination/idempotency/error conventions
spec/core/        actors, roles, permissions, dictionary, schema, status_codes, integrations
spec/security/    access_matrix, data_classification, secrets_policy, threat_model, security_baseline
spec/tests/       acceptance / regression / security tests
spec/runbooks/    build / deployment / rollback runbooks
spec/modules/<id> 30 modules (19 company + 11 olympiads), each with 12–33 spec files
adrs/ threat-models/ design-system/ seed/ workers/ observability/ deployment/
app/              the Next.js skeleton (stubs)
overlays/         business-feature repo overlay (kept separate to avoid clobbering app/)
generators/       the questionnaire→spec playbook + executable build scripts
source-of-truth/  answered questionnaires, BRD section CSVs, master BRD, registries
reports/          this report + provenance + module sources
```

## 3. Findings

### 3.1 The two tracks are COMPLEMENTARY LAYERS, not duplicates — strong
- **Olympiads track** owns the **canonical core entities**: `schools`, `school_users`,
  `students`, `participations`, `olympiads`, `payments`, `results`, `certificates`,
  `exam_slots`, `omr_imports`, `courier_batches`.
- **Company track** adds **operational/workflow tables** on top: `finance_invoices`,
  `result_batches`, `candidate_results`, `certificate_templates`, `school_onboarding_cases`,
  `student_roster_batches`, `exam_cycles`, `evaluation_*`, etc.
- **Genuine collisions** = a handful of core tables declared in BOTH tracks and needing a
  single owner: **`exam_slots`, `certificates`, `results`, `students`, `schools`, `payments`,
  `participations`**.

### 3.2 Two schema generations for the olympiad modules — needs a merge decision
| | Individual olympiad packs (chosen as canonical) | Codex full pack |
|---|---|---|
| `id` | `required: true` ✓ | `required: false` ✗ |
| types | atomic (`string`, `uuid`, `many-to-one:olympiads`) ✓ | prose (`"string unique"`) ✗ |
| enums | `allowed_values: [...]` ✓ | options buried in `rule` text |
| per-field metadata | minimal | **rich**: `security_level`, `source_question_id`, `build_instruction`, `test_instruction` |

The clean tree uses the **cleaner individual-pack schemas**. The codex pack's **BRD
traceability + per-field build/test instructions** are valuable and worth grafting on.

### 3.3 Company-track schemas are clean and buildable — strong
Atomic types, `id required:true`, enums via `allowed_values`, `unique_business_keys`,
`status_field`, `primary_key` declared. 1421 fields across 19 modules, **0 structural defects**.
(An earlier "183 enum issues" count was a **false positive in the validator** — options live
in `allowed_values`, not in `rule`.)

### 3.4 Specs are authored for DIRECTUS; chosen stack is Supabase + RLS — reconcile
Schemas carry `many-to-one:<table>` relationship notation and `directus_permission_note`.
The BRD answers also mention Directus. We chose **Supabase (Postgres + RLS)**. This needs a
translation step: relationship notation → Postgres FKs, and `directus_permission_note` +
`RLS_POLICY_MATRIX.json` → real RLS policies. Not hard, but must be explicit.

### 3.5 `DATABASE_SCHEMA_REGISTRY.json` is company-only and shallow
It lists the 19 company modules as **collection counts**, not columns, and **excludes the
olympiad core tables** the company modules depend on. It is NOT yet a true canonical model.

### 3.6 Intent-doc ("Vibe Coding Flow") coverage — strong
All 21 control files it tells the LLM to read first **exist** in the tree
(`BUILD_PLAN`, `AUTOPILOT`, `MASTER_DATA_MODEL`, `RLS_POLICY_MATRIX`, `FIELD_MASKING_MATRIX`,
`HIGH_RISK_ACTIONS`, `FEATURE_FLAGS`, `openapi.json`, `ADR_INDEX`, `THREAT_MODEL_OVERVIEW`,
`DESIGN_SYSTEM`, `JOB_REGISTRY`, `QUEUE_CONFIG`, `CI_CD_PIPELINE`, …). The flow is sound.

### 3.7 The app is a labeled skeleton — confirmed
Every `service.ts` returns empty/`skeleton_created`; `requireStaffScope` returns a hardcoded
`super_admin`; `createAuditEvent` is fake; `migrations/0001_init.sql` is a placeholder.
Conventions are right; implementation is ~5% real.

## 4. Proposed reconciliation (HOLD for approval — these rewrite source-of-truth)

1. **Single canonical data model.** Merge olympiad core tables (clean types) + company ops
   tables into ONE `DATABASE_SCHEMA_REGISTRY` with real columns. Dedup the ~7 shared tables to
   a single owner (olympiad core owns the entity; company modules reference it).
2. **Graft traceability.** Carry `security_level` / `source_question_id` / `build_instruction`
   from the codex schemas onto the canonical fields (keeps the BRD→field audit trail).
3. **Stack translation.** Generate Postgres DDL + RLS policy stubs from the canonical model,
   driven by `RLS_POLICY_MATRIX.json` + `FIELD_MASKING_MATRIX.json`. Resolve Directus-vs-Supabase
   in an ADR.
4. **Shared-table ownership decisions** (need user/business input): `exam_slots`, `certificates`,
   `results`, `students`, `schools`, `payments`, `participations`.

## 5. Suggested tweaks to the Vibe Coding Flow intent doc
- Add **Step 0.5 — Reconcile two-track schema into one canonical registry** before "Foundation".
  The current flow assumes the merged model already exists; it does not.
- Add an **ADR resolving Directus vs Supabase** and a **schema-translation step**; specs are
  Directus-flavored, build target is Supabase.
- Add a **data-model contract test** ("validate every `schema.json` against the canonical
  registry") to the Test Loop, alongside the API-contract check.
- Everything else (read-control-files-first, high-risk STOP list, 2-attempt repair cap,
  per-module Definition of Done) is strong — keep as-is.
```
