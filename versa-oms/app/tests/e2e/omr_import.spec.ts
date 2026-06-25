import { test, expect } from "@playwright/test";

// FR-OMR-IMPORT-2026-0010 — the chain's real entry point: upload a candidate-responses CSV into an
// import batch and persist evaluation_candidate_responses (upstream of scoring). Isolated fixture
// (E2E-IMP-OMR, school-scoped) so the scoring/ranking fixtures stay clean.
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });
const csv = (rows: string[]) => "candidate_id,Q1,Q2,Q3,Q4\n" + rows.join("\n") + "\n";

test("OMR import: upload a responses CSV -> persisted candidate responses", async ({ request }) => {
  const ibs = (await (await request.get("/api/staff/evaluation/import-batches?q=E2E-IMP-OMR")).json()).data.items as Array<Record<string, unknown>>;
  const ib = ibs.find((b) => b.import_batch_code === "E2E-IMP-OMR");
  test.skip(!ib, "run _validation/seed_chain3.sql (E2E-IMP-OMR)");
  const u = `${Date.now()}`;

  const content = csv([`OMR-${u}-1,A,B,C,D`, `OMR-${u}-2,A,X,C,`, `OMR-${u}-3,Z,Z,Z,Z`]);
  const res = await (await request.post(`/api/staff/evaluation/import-batches/${ib!.id}/ingest`, {
    headers: STAFF(`oi-${u}`), data: { content, filename: "responses.csv" },
  })).json();
  expect(res.ok).toBe(true);
  expect(res.data.imported).toBe(3);
  expect(res.data.batch_status).toBe("validated");

  const resp = (await (await request.get(`/api/staff/evaluation/import-batches/${ib!.id}/candidate-responses?page_size=100`)).json()).data.items as Array<Record<string, unknown>>;
  const by = Object.fromEntries(resp.map((r) => [r.candidate_id, r]));
  expect(by[`OMR-${u}-1`], "imported response persisted").toBeTruthy();
  expect(by[`OMR-${u}-1`].response_payload).toEqual({ Q1: "A", Q2: "B", Q3: "C", Q4: "D" });
  expect((by[`OMR-${u}-2`].response_payload as Record<string, string>).Q4).toBe(""); // blank answer kept
  expect((by[`OMR-${u}-3`].response_payload as Record<string, string>).Q1).toBe("Z");
});
