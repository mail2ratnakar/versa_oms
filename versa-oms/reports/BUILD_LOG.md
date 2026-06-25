# Versa OMS — Build Log (chronological, append-only)

Per-CR record of what shipped, the verification evidence, and what was deferred.
Maintained as step 11 of `spec/BUILD_PROCESS.md` (status-everywhere rule). Newest first.
Companion to `reports/BUILD_STATUS.md` (current-state snapshot) and the persistent memory
`versa-oms-state-of-build.md`.

| Date | CR | Commit | Summary | Verify | Deferred |
|---|---|---|---|---|---|
| 2026-06-25 | FR-SECURE-FILE-DOWNLOAD-2026-0003 | _pending_ | P1 secure file download (§3.5): wired the signedUrl engine (was 0 routes) — storeFile (private bucket provision + upload + file_metadata) + makeSecureDownloadHandler (scope + audit + 900s signed URL + 409 graceful); roster ingest now stores its source file (closes 0002 deferral) → proven via real Supabase signed URL; ModuleTable downloadAction on both roster pages | tsc0 · 193 vitest (+6) · 36 e2e (+1 live signed URL, cross-school 404, no-file 409) · check_generated clean | downloadAction opt-in for certificates/materials/exports (no stored files yet); retention/lifecycle policy on file_metadata |
| 2026-06-25 | FR-STUDENT-ROSTER-OPS-2026-0002 | 3d0b6a5 | P1 roster CSV/XLSX ingestion (upload→validate→review→commit) on student_roster_batches; both portals; engine + service (CAS-claim concurrency) + ModuleTable uploadAction; mapped §3.1 lock gates | tsc0 · 187 vitest (+21) · 35 e2e (+5) · check_generated clean · chain3 regression green | binary file storage (signed-URL/retention); count-finalise guards |
