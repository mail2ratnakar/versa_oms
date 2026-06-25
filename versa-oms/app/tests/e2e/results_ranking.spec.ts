import { test, expect } from "@playwright/test";

// FR-RESULTS-RANKING-2026-0006 — results_ops:generate ranks the batch's candidate_results
// server-side (competition ranking) + snapshots certificate eligibility; published result batches
// are immutable in place. Fixture: seed_chain3.sql (E2E-RESBATCH-CH6 + 4 scored candidate_results,
// E2E-RESBATCH-PUB published).
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("generate ranks candidate results + eligibility snapshot; published batch is immutable", async ({ request }) => {
  const batches = (await (await request.get("/api/staff/results?q=E2E-RESBATCH-CH6")).json()).data.items as Array<Record<string, unknown>>;
  const batch = batches.find((b) => b.result_batch_code === "E2E-RESBATCH-CH6");
  test.skip(!batch, "run _validation/seed_chain3.sql (result-ranking fixtures)");
  const u = `${Date.now()}`;

  // Trigger ranking. generate ranks from 'draft'; if a prior run already generated this batch (e2e
  // share live DB and aren't reset between runs), the ranks persist — so we assert the ranking
  // INVARIANT below rather than requiring this specific call to win the from-state guard.
  await request.post(`/api/staff/results/${batch!.id}/actions/generate`, { headers: STAFF(`rg-${u}`), data: { reason: "generate + rank" } });

  // candidate_results are now ranked server-side (competition ranking 1,2,2,4) + eligibility snapshotted.
  const cands = (await (await request.get(`/api/staff/results/${batch!.id}/candidate-results`)).json()).data.items as Array<Record<string, unknown>>;
  const by = Object.fromEntries(cands.map((c) => [c.candidate_id, c]));
  expect(by["E2ECH6-1"].national_rank).toBe(1);
  expect(by["E2ECH6-2"].national_rank).toBe(2);
  expect(by["E2ECH6-3"].national_rank).toBe(2); // tie shares the rank
  expect(by["E2ECH6-4"].national_rank).toBe(4); // competition ranking skips 3
  expect(by["E2ECH6-1"].result_status).toBe("ranked");
  expect(by["E2ECH6-1"].certificate_eligibility_status).toBe("eligible");
  expect(by["E2ECH6-4"].certificate_eligibility_status).toBe("not_eligible"); // 20% below the pass threshold

  // Immutability: a PUBLISHED result batch cannot be edited in place (-> 422).
  const pubs = (await (await request.get("/api/staff/results?q=E2E-RESBATCH-PUB")).json()).data.items as Array<Record<string, unknown>>;
  const pub = pubs.find((b) => b.result_batch_code === "E2E-RESBATCH-PUB");
  if (pub) {
    const patch = await request.patch(`/api/staff/results/${pub.id}`, { headers: STAFF(`rp-${u}`), data: { ranking_policy_version: "v2" } });
    expect(patch.status()).toBe(422);
    expect(JSON.stringify(await patch.json())).toMatch(/immutab|published|correction/i);
  }
});
