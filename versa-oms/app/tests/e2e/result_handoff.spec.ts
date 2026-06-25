import { test, expect } from "@playwright/test";

// FR-RESULT-HANDOFF-2026-0009 — closes the chain: results_ops:generate on a batch with no
// candidate_results populates them from its linked (scored) evaluation score batch, then ranks +
// snapshots eligibility. Proves scores -> candidate_results -> ranking end to end.
// Fixture: seed_chain3.sql (E2E-SCORE-CH6 + E2E-AKEY-7002 approved + E2ESCORE-1/2/3, E2E-RESBATCH-HANDOFF).
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("score->result handoff: generate derives candidate_results from scores, then ranks + scores eligibility", async ({ request }) => {
  const sbs = (await (await request.get("/api/staff/evaluation/score-batches?q=E2E-SCORE-CH6")).json()).data.items as Array<Record<string, unknown>>;
  const scoreBatch = sbs.find((b) => b.score_batch_code === "E2E-SCORE-CH6");
  const rbs = (await (await request.get("/api/staff/results?q=E2E-RESBATCH-HANDOFF")).json()).data.items as Array<Record<string, unknown>>;
  const resBatch = rbs.find((b) => b.result_batch_code === "E2E-RESBATCH-HANDOFF");
  test.skip(!scoreBatch || !resBatch, "run _validation/seed_chain3.sql (handoff fixtures)");
  const u = `${Date.now()}`;

  // 1. Ensure the score batch is scored (populates evaluation_candidate_scores).
  await request.post(`/api/staff/evaluation/score-batches/${scoreBatch!.id}/score`, { headers: STAFF(`hs-${u}`) });
  // 2. Generate the result batch -> handoff (scores -> candidate_results) + rank. Idempotent across runs,
  //    so assert the INVARIANT (the derived, ranked candidate_results) not this single generate call.
  await request.post(`/api/staff/results/${resBatch!.id}/actions/generate`, { headers: STAFF(`hg-${u}`), data: { reason: "handoff + rank" } });

  const cands = (await (await request.get(`/api/staff/results/${resBatch!.id}/candidate-results`)).json()).data.items as Array<Record<string, unknown>>;
  const by = Object.fromEntries(cands.map((c) => [c.candidate_id, c]));

  // candidate_results were DERIVED from the scores (not seeded directly into this batch).
  expect(by["E2ESCORE-1"], "candidate result derived from the score").toBeTruthy();
  expect(Number(by["E2ESCORE-1"].raw_score)).toBe(4);
  expect(Number(by["E2ESCORE-1"].max_score)).toBe(4);
  expect(Number(by["E2ESCORE-1"].percentage_score)).toBe(100);
  expect(by["E2ESCORE-1"].national_rank).toBe(1); // top score
  expect(by["E2ESCORE-1"].certificate_eligibility_status).toBe("eligible");

  expect(Number(by["E2ESCORE-2"].percentage_score)).toBe(50);
  expect(by["E2ESCORE-2"].certificate_eligibility_status).toBe("eligible");

  expect(Number(by["E2ESCORE-3"].percentage_score)).toBe(0);
  expect(by["E2ESCORE-3"].certificate_eligibility_status).toBe("not_eligible"); // 0% below threshold
});
