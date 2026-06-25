import { test, expect } from "@playwright/test";

// FR-OMR-SCORING-2026-0008 — score an evaluation batch against the approved answer key: reads the
// import batch's candidate responses, scores each (scoreResponses), and persists
// evaluation_candidate_scores. Fixture: seed_chain3.sql (E2E-SCORE-CH6 + E2E-AKEY-7002 approved +
// E2ESCORE-1/2/3 responses).
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("score batch persists per-candidate scores (correct/wrong/blank)", async ({ request }) => {
  const batches = (await (await request.get("/api/staff/evaluation/score-batches?q=E2E-SCORE-CH6")).json()).data.items as Array<Record<string, unknown>>;
  const batch = batches.find((b) => b.score_batch_code === "E2E-SCORE-CH6");
  test.skip(!batch, "run _validation/seed_chain3.sql (OMR scoring fixtures)");
  const u = `${Date.now()}`;

  const res = await (await request.post(`/api/staff/evaluation/score-batches/${batch!.id}/score`, { headers: STAFF(`sc-${u}`) })).json();
  expect(res.ok).toBe(true);
  expect(res.data.scored).toBeGreaterThanOrEqual(3);
  expect(res.data.score_batch_status).toBe("scored");

  const scores = (await (await request.get(`/api/staff/evaluation/score-batches/${batch!.id}/candidate-scores`)).json()).data.items as Array<Record<string, unknown>>;
  const by = Object.fromEntries(scores.map((s) => [s.candidate_id, s]));

  expect(Number(by["E2ESCORE-1"].raw_score)).toBe(4); // all correct
  expect(by["E2ESCORE-1"].correct_count).toBe(4);

  expect(Number(by["E2ESCORE-2"].raw_score)).toBe(2); // 2 correct, 1 wrong, 1 blank
  expect(by["E2ESCORE-2"].correct_count).toBe(2);
  expect(by["E2ESCORE-2"].wrong_count).toBe(1);
  expect(by["E2ESCORE-2"].blank_count).toBe(1);

  expect(Number(by["E2ESCORE-3"].raw_score)).toBe(0); // all wrong
  expect(by["E2ESCORE-3"].wrong_count).toBe(4);
});
