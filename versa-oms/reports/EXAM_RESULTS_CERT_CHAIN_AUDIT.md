# Exam-Results → Certificate Chain Audit (2026-06-26)

Read-only audit run while reconciling the certificate-eligibility model. Goal: map every table in the
evaluation → results → certificate chain — live data, key integrity, built vs specced-only vs dead — so the
foundational identity decision can be made on facts.

## The chain (rows · key integrity · status)

| # | Table | Rows | Key integrity | Status |
|---|-------|------|---------------|--------|
| 1 | evaluation_score_batches | 1 | ✅ keyed | built |
| 2 | evaluation_candidate_scores | 3 | ⚠️ `candidate_id` UNKEYED | built (data) |
| 3 | evaluation_answer_keys | 2 | ✅ | built |
| 4 | result_batches | 3 | ✅ | built |
| 5 | **candidate_results** | **14** | ⚠️ `candidate_id` UNKEYED | **LIVE** (eligibility computed here) |
| 6 | results | **0** | ✅ keyed (student_id, participation_id) | **DEAD** (specced — 46 refs, a workflow + screens in 6 modules — but never populated) |
| 7 | result_corrections | 0 | → results (dead) | unbuilt |
| 8 | result_publication_windows | 0 | → result_batches | unbuilt |
| 9 | result_rank_snapshots | 0 | → result_batches | unbuilt |
| 10 | certificate_requests | 1 | → certificates, result_corrections(dead) | thin |
| 11 | **certificates** | **139** | student_id ✅ · `result_id` → results (DEAD, always null) | **LIVE but mis-linked** |
| 12 | certificate_eligibility_snapshots | 0 | candidate_result_id ✅ · `candidate_id` UNKEYED | designed, unbuilt |
| 13 | certificate_templates | 0 | — | unbuilt |
| 14 | **students** | **211** | ⚠️ `candidate_id` UNKEYED (only 2/211 populated) · participation_id ✅ | LIVE |
| 15 | participations | 1 | ✅ | barely populated |

## The core finding: a broken identity spine

`candidate_id` is the *intended* business key threading the whole chain — it appears on
evaluation_candidate_scores, candidate_results, certificate_eligibility_snapshots, **and students**. But it is:

- **Unkeyed** — no FK / uniqueness constraint anywhere; pure free string.
- **Inconsistently formatted** — candidate_results uses `E2ECH6-1` / `D17823…`; students use `E2ECH3SCH-00001`.
- **Barely populated** — students: **2 of 211** have any candidate_id.
- **Zero overlap** — `candidate_results.candidate_id ∩ students.candidate_id = 0`.

So the chain is **two disconnected halves**:
- **Exam half** (evaluation_candidate_scores → candidate_results): keyed by the synthetic `candidate_id` code; has the data + the eligibility computation. Live.
- **Student/cert half** (students → certificates): keyed by real `student_id` UUIDs; has the data. Live.
- **The bridge between them is missing**: `results` (the properly-keyed bridge the FKs anticipate) is dead/empty; `candidate_id` (the business-key bridge) is unkeyed + inconsistent + non-overlapping; the snapshot table is unbuilt.

**Root cause:** no end-to-end test ever threads candidate → result → student → certificate. The two halves were even seeded from different fixtures (`E2ECH6` vs `E2ECH3SCH`), so nothing forced them to reconcile. The whole "scores → results → ranking → cert" chain (documented in `resultHandoff.ts`) is built only up to ranking; the **result → student → certificate leg was never closed**.

## The decision (foundational — only the founder can make it)

How does an exam-side **candidate** become a cert-side **student**? Three modeling options:

- **A — Fix `candidate_id` as the canonical business key.** Populate it consistently on students + eval +
  candidate_results, add a uniqueness constraint, join on it. *Cheapest, but fragile (string business keys,
  weak integrity), and requires backfilling 209 students.*
- **B — Revive `results` as the keyed bridge.** Populate `results` (student_id, participation_id) at handoff
  and keep `certificates.result_id → results`. *Uses the FKs the schema already declares — but still needs
  candidate→student resolution, and revives a table that's otherwise dead.*
- **C — Add `candidate_results.student_id → students` (real FK).** *(recommended)* Resolve candidate→student
  ONCE at handoff and store the UUID; then candidate_results → students → certificates is a clean FK path,
  the eligibility gate + snapshot wire cleanly, and neither the dead `results` table nor the messy business
  key is needed. **Prerequisite for all three:** an identity backbone — a student registering for an exam
  (`participations`) must mint a stable candidate identity that flows exam → result and resolves back to the
  student. That backbone is the unbuilt core.

## Recommendation
Target **Option C**, but recognize it depends on building the **candidate-identity backbone** at the
registration/participation layer (today `participations` has 1 row and no candidate link). That is a real,
foundational build — not a migration. Until it exists, the eligibility rule + compiled checker stay
authored-but-unwired (correct, not a fake gate). The frozen-route characterize-first pass is independent and
can proceed in parallel.
