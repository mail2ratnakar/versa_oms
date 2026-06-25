# Versa OMS — Spec vs Built Gap Analysis (all 30 modules)

Date: 2026-06-24 · Method: BUILD_PROCESS master loop (brain → skills 17 Gap Detection / 03 Screen Contract / 13 UI / 05 API Contract). Evidence gathered by 6 parallel readers over `spec/modules/<m>/*.json` vs built `app/app/**/page.tsx` + `server/modules/<m>/service.ts` + shared `components/ModuleTable.tsx`.

## 1. Executive summary

The platform has a **strong spec layer and a strong generic engine**, but most modules sit at **scaffold** level: a generated `ModuleTable` list (now with status chips, toolbars, clean columns, lifecycle actions with confirm/reason, and read/write detail panels for a couple of modules) over a `defineModule` kernel that enforces **only status + role**. The domain logic that gives each module its reason to exist — server-side gates, computation, masking, secure files, ingestion, reconciliation, dashboards, cross-module effects — is largely **specified but not wired**.

**One reference implementation** (`school_crm`) shows the intended depth. **Two control modules** (`notifications`, `reports_exports`) are list-functional with working dual-approval lifecycle config. `school_onboarding_ops` is the most-hardened spine module (toolbar + actions + confirm/reason + read & write detail panels) but still has domain gaps. **Everything else is scaffold.**

## 2. Readiness scoreboard

Legend: **LF** local-functional · **SF+** scaffold, UI-hardened · **SF** scaffold · **DUP/ORPH** duplicate/orphaned spec track · screens = spec'd → built (built count includes generic/partial pages).

| Module | Readiness | Screens | Headline gap |
|---|---|---|---|
| school_crm | **LF** | 7→1 | 6/7 screens missing; per-stage transition guards not enforced |
| school_onboarding_ops | **SF+** | 6→3 | SLA/verification/audit-timeline panels; coordinator verify; masking; activation precondition; block/suspend `reasonRequired:false` vs policy |
| schools | SF | 3→1 | registration + coordinator dashboard missing; coordinator-activation workflow; toolbar/detail |
| students | SF | 3→2 | **entire CSV upload + validation-review flow missing** (core purpose); empty transitions; PII masking |
| student_roster_ops | SF | 6→2 | upload-on-behalf + ledger + exports screens; ~half transitions; PII/export masking; school-gate not server-enforced |
| finance_ops | SF | 7→5 | **client-trusted amounts** (create form types gross/net/balance); invoice/reconciliation actions; export+masking |
| payments | SF/DUP | 3→3 | identity split (`core_payments` empty vs `finance_payments`); amount not server-calc; no reconciliation |
| exam_slot_ops | SF/DUP | 8→3 | page drives `exam_cycles` not slots; capacity/blackout/conflict/payment/roster gates all missing |
| exam_slots | SF/DUP | 3→1 | **no booking subsystem**; `publish_slot` missing; capacity rules absent |
| exam_material_ops | SF | 10→3 | **secure download unwired** (`signedUrl.ts` referenced by 0 routes); generation gates; release timer; replacement |
| exam_materials | SF/DUP | 3→3 | duplicate of `*_ops`; secure download + download-audit absent; create omits required `olympiad_id` |
| evaluation_ops | SF | 8→5 | OMR/CSV import not wired (`importConfig` absent); scoring engine **orphaned**; results-handoff missing; PII raw |
| results_ops | SF→PF* | 8→6 | *FR-RESULTS-RANKING-0006 (2026-06-25): server-side ranking (national/grade/subject, competition ranking) + certificate-eligibility snapshot on generate + published-result immutability (in-place edits blocked); migration 0022 fixed broken candidate_results UNIQUE constraints. REMAINING: full correction-versioning (new batch), finance-hold, tie-break policy, ranking_policy threshold config |
| results | SF/ORPH | 3→0 | build follows `results_ops`; this spec orphaned — decide deprecate/reconcile |
| certificate_ops | SF→LF* | 9→7 | *FR-CERT-GENERATION-0004 + FR-CERT-PDF-0005 (2026-06-25): server-gen number/code, publish→public_verification, revoke reflected, real verify page, **PDF generation + private storage + secure signed download (staff+school) with QR**. REMAINING: digital signature/seal + tamper hash, reissue/impact handling, core_certificates from-state guards, olympiad/award result-join |
| certificates | SF/DUP | 4→3 | duplicate; create lets user type unique `certificate_number`; template can never reach `active` (dead gate) |
| courier_ops | SF | 10→5 | **count reconciliation missing** (core purpose); evaluation-intake handoff; generic `{code}` columns |
| courier | SF/STRANDED | 3→1 | reconciliation + receipt/exception + school-return unbuilt in *both* courier tracks |
| omr_imports | SF/DUP | 3→4 | **no OMR import flow** (importConfig never wired); no scoring/candidate-score writes; two unreconciled tracks; broken create |
| notification_ops | SF | 9→2 | 7/9 screens; template can't reach `active` → send path unreachable; no send/retry/dry-run controls |
| notifications | **LF** | 4→2 | events + delivery-queue + school inbox missing; no template editor/preview |
| reports_exports | **LF** | 9→2 | download (signed URL+audit) absent; masking not enforced; sensitive-export auto-gate missing |
| support_tickets | SF | 9→4 | lifecycle gutted (only close/archive); no assign/escalate/resolve; school portal stub; SLA invisible |
| task_work_queue | SF | 9→4 | 6+ core transitions missing; no dashboards/approval-queue; no task-creation UI; SLA/escalation invisible |
| roles_permissions | SF | 6→2 | permission/approval matrix + access-review screens missing; SoD/last-super-admin guards absent |
| staff_users | SF | 6→3 | invite/accept/provision flow incomplete; disable/reactivate + session-revoke missing; security validations absent |
| admin_settings | SF | 8→3 | no activation/rollback engine; **no settings-resolution API** (core contract); secret masking; criticality-aware approval |
| audit | SF | 6→4 | **no central event ingestion** (core purpose); tamper-evidence/hash-chain absent; wrong route tree |
| security_audit_console | SF | 10→8 | dashboard + alerts + login-monitoring + drift missing; lifecycles collapsed to close/archive; role over-grant |
| company_dashboard | SF | 5→1 | 10 generic counts vs ~23 spec'd KPIs; **non-admins see global totals (scope/RLS bypass)**; no alerts/filters/drilldown |

## 3. Systemic cross-cutting gaps (highest leverage — fix in the engine, P0.6)

These repeat in almost every module; each is one engine-level fix that lifts many pages.

1. **Transition gates are declared fail-closed but the registries are empty.** `TRANSITION_GUARDS` contains only `school_onboarding_ops`; `transitionPreconditions` / `transitionEffects` / `transitionJobs` have ~no entries for the business modules. Net effect: **every spec precondition (payment/slot/roster/eligibility/handoff/maker-checker/school-active) is silently skipped**, and actions are allowed from any state. This is the single biggest correctness gap.
2. **Server-side computation missing or orphaned.** Amounts in finance/payments are **typed by the client** (violates `amounts_server_calculated`). Ranking/tie-break, OMR scoring (`eval/scoring.ts`), certificate number/code/QR/hash (`eval/certificate.ts`), result versioning/immutability, eligibility snapshots — either absent or implemented-but-unwired dead code.
3. **Field-level PII/role masking enforced nowhere** except `school_crm`, despite every module's `data_classification.json`/`field_restrictions`. Sensitive fields (PII, payment refs, raw OMR payloads, verification codes, secrets, recipient contacts) are returned in clear. `ModuleTable` has no masking layer.
4. **Ingestion/upload/validation flows unbuilt.** `importConfig` is never passed on the modules whose *purpose* is ingest: students CSV, roster upload, OMR import, school registration. The 2-stage upload→validate→review→commit pattern exists only in CRM import.
5. ~~**Secure file handling unwired.**~~ **PARTIALLY CLOSED (FR-SECURE-FILE-DOWNLOAD-0003, 2026-06-25):** the signed-URL engine is now wired — `storeFile` (private bucket + `file_metadata`) + `makeSecureDownloadHandler` (scope + audit + 900s signed URL) + `ModuleTable.downloadAction`. Proven on the roster source file (real signed URL, cross-school 404, no-file 409). REMAINING: opt-in the same `downloadAction`/`storeFile` for exam materials, certificates, reports/exports once those records carry stored files (engine + factory ready).
6. **Dashboards, entity-detail, and exports screens missing across the board.** Dashboard roots are bare tables (no KPI/queues/alerts/filters/drilldown); `[id]` detail pages and `/exports` screens are largely absent.
7. **Duplicate / orphaned spec tracks.** `payments` (core_payments empty) vs `finance_payments`; `exam_slot_ops` vs `core_exam_slots`; `exam_material_ops` vs `exam_materials`; `results` vs `results_ops`; `courier` vs `courier_ops`; `omr_imports` (core/omr) vs `evaluation_ops/*`. Pages bind one track while the spec describes another → confusion + broken creates. **Decide canonical track and migrate before building depth.**
8. **Generated create forms drift from server Zod schemas** → broken creates: omr core, courier core (omits `school_id`/`participation_id`/`courier_direction`), certificates (user types unique number — fixed FR-CERT-GENERATION-0004), evaluation/results forms omit required FKs → 422. **Related schema-integrity bug FIXED (FR-SCHEMA-UNIQUES-0007, migrations 0022+0023):** the DDL generator created single-column UNIQUE constraints on FK/version columns across many tables (candidate_results, eval responses/scores, notification_recipients, *_version) that silently made one-to-many + versioning impossible; replaced with natural keys + a `check_unique_constraints.py` guardrail.
9. **Child-entity writes mostly read-only.** Detail panels are read-only except where write panels were added (onboarding documents, finance adjustments). Ticket replies/notes/attachments, task comments, permission-rule edits, assignment writes have no POST path.
10. **Security/authorization issues to fix now:** `company_dashboard` counts use the **service-role admin client with no assignment-scope filter** → non-admins see global totals (RLS bypass); `security_audit_console` grants `support_manager` read/write (policy violation) and root page lets a user *create* an audit event (violates append-only); `certificates` core grants `public` read; `notification_ops` over-grants write to coordinator/support; role policy arrays are coarse/copy-pasted across sub-modules.
11. **Notifications fan-out + audit ingestion are the two missing nervous systems.** ~16 modules are spec'd to emit notifications/audit events; only CRM follow-ups emit notifications and no module writes audit events through a central `recordEvent`. Tamper-evidence/hash-chain entirely absent.
12. **Lifecycle status enums drift between policy JSON, generated service, and UI facets** (e.g. onboarding block/suspend `reasonRequired:false` vs blocking policy; notification facet uses `superseded` and drops `under_review`; templates can never reach `active` so send/generate paths are unreachable).

## 4. Upstream → downstream chain integrity

The product is one long chain. Where it breaks today:

```
CRM lead ──convert──▶ onboarding case ──approve/activate──▶ school (active)
   [LF]                  [SF+: activation precondition NOT enforced]      [SF: coordinator activation + portal unbuilt]
        ──▶ students (CSV upload) ──finalise count──▶ roster lock ──▶ candidate IDs
              [SF: upload flow MISSING]   [SF: transitions empty]   [SF: gen not gated by school-active]
        ──▶ finance invoice (from locked roster) ──mark_paid (dual)──▶ payment gate
              [SF: amounts client-typed; only mark_paid wired]            [partial]
        ──▶ exam slots (book, capacity) ──▶ exam materials (generate, secure release)
              [SF: no booking subsystem]      [SF: gates + secure download unwired]
        ──▶ courier dispatch ──receipt+reconcile──▶ OMR import ──score──▶ evaluation
              [SF: reconciliation missing]        [SF: import+scoring unwired/orphaned]
        ──▶ results (rank, publish) ──eligibility──▶ certificates (generate, verify)
              [SF: ranking/versioning missing]        [SF: generation/QR dead code]
Cross-cutting: notifications · audit · tasks · dashboard  — all spec'd to fan in/out; mostly unwired.
```

**Verdict:** the chain is *navigable as data* (each table exists and lists), but the **gates and effects that make it a workflow are not enforced** — so the chain currently relies on manual status flips and would not hold under real use (e.g., you can activate a school without verification, generate materials without payment, publish results without ranking, issue certificates without eligibility).

## 5. Prioritized roadmap (recommended order)

**P0 — Correctness & security foundations (engine, lift every module):**
- P0.1 **Populate the gate registries**: move each module's spec preconditions/effects into `transitionPreconditions`/`transitionEffects`/`transitionJobs` (+ extend `TRANSITION_GUARDS` beyond onboarding). Start with the money/safety gates: school-active, payment, roster-lock, eligibility, maker-checker.
- P0.2 **Server-calculated amounts** (finance/payments): strip client amount inputs; compute gross/tax/commission/net server-side.
- P0.3 **Field-level masking layer** in the kernel + `ModuleTable`, driven by `field_restrictions`/`data_classification` (one fix, all modules).
- P0.4 **Dashboard scope fix**: replace the service-role unscoped counts with assignment-scoped queries; remove append-only violations + role over-grants flagged in §3.10.
- P0.5 **Reconcile duplicate spec tracks** (§3.7) — pick canonical, redirect pages, delete/ztombstone the orphan; fixes broken creates too.

**P1 — Each module's signature workflow (depth, module-by-module along the chain):**
- students CSV upload + validation-review; roster upload-on-behalf + ledger; finance invoice/reconciliation actions; exam-slot booking subsystem; exam-material secure download + generation gates + release timer; courier count reconciliation + handoff; OMR import + scoring; results ranking + versioning + eligibility snapshot; certificate generation + QR verify page.
- Wire **secure file download** (`signedUrl`) + `downloadAction` everywhere files exist (P0.6 generalize, like detail panels).

**P2 — Control plane & cross-cutting:**
- Central **audit ingestion** (`recordEvent`) + tamper-evidence; **notification fan-out**; **task/SLA** lifecycle + escalation→task; settings **resolution API** + activation/rollback; roles permission/approval **matrix** + SoD guards; missing **dashboards/detail/exports** screens.

**P3 — School-portal surfaces & exports:** school registration, coordinator dashboard, school results/materials/certificates download with own-scope + published-only filters; controlled exports with masking + watermark + audit.

## 6. What's already solid (don't re-litigate)
Generic engine (kernel + ModuleTable), list/toolbar/facet/clean-columns across all pages, lifecycle actions with destructive-confirm + reason, read & write detail panels (config-driven; onboarding documents + finance adjustments live), CRM end-to-end (import/dedupe/convert/comms with dual-approval + masking + audit), staff identity foundation, the browser feedback loop + test registry. These are the proven patterns to extend.
