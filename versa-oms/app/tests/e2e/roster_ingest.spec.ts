import { test, expect } from "@playwright/test";

// FR-STUDENT-ROSTER-OPS-2026-0002 — roster CSV ingestion: upload -> validate -> review -> commit.
// A school uploads a student file to a batch; the engine parses + validates each row, writes
// valid students, rolls counts/reports onto the batch, and gates lock on a fully-clean roster.
// Fixture: seed_chain3.sql (E2E-CH3-SCH school + E2E-PART-CH3 participation).
const SID = (sid: string, key: string) => ({ "content-type": "application/json", "x-dev-school": sid, "x-idempotency-key": key });

async function fixtures(request: import("@playwright/test").APIRequestContext) {
  const schools = (await (await request.get("/api/staff/core/schools?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  const parts = (await (await request.get("/api/staff/core/participations?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const part = parts.find((p) => p.participation_code === "E2E-PART-CH3");
  return { school, part };
}

async function newBatch(request: import("@playwright/test").APIRequestContext, sid: string, partId: string, tag: string) {
  const res = await request.post("/api/school/roster", {
    headers: SID(sid, `rost-${tag}`),
    data: { participation_id: partId, source_type: "school_uploaded" },
  });
  const body = await res.json();
  return String(body.data.id);
}

const csv = (rows: string[]) => "student_name,grade,consent_obtained,section,school_roll_number\n" + rows.join("\n") + "\n";

test("clean roster ingests -> validated, students committed, then submit succeeds", async ({ request }) => {
  const { school, part } = await fixtures(request);
  test.skip(!school || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}`;
  const batchId = await newBatch(request, sid, String(part!.id), u);

  const content = csv([`Ingest ${u} A,5,yes,A,${u}-R1`, `Ingest ${u} B,6,1,B,${u}-R2`]);
  const res = await request.post(`/api/school/roster/${batchId}/ingest`, {
    headers: SID(sid, `ing-${u}`),
    data: { file_type: "csv", filename: "roster.csv", content },
  });
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.data.batch_status).toBe("validated");
  expect(body.data.counts).toMatchObject({ total: 2, valid: 2, invalid: 0, duplicate: 0 });
  expect(body.data.students_written).toBe(2);

  // A clean (validated) batch can be submitted for lock.
  const sub = await request.post(`/api/school/roster/${batchId}/actions/submit`, { headers: SID(sid, `sub-${u}`), data: {} });
  expect((await sub.json()).ok).toBe(true);
});

test("roster with invalid rows -> validation_failed, NO students committed, submit blocked", async ({ request }) => {
  const { school, part } = await fixtures(request);
  test.skip(!school || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}-bad`;
  const batchId = await newBatch(request, sid, String(part!.id), u);

  const content = csv([`Good ${u},5,yes,A,${u}-R1`, `,6,yes,B,${u}-R2`]); // 2nd row blank name
  const res = await request.post(`/api/school/roster/${batchId}/ingest`, {
    headers: SID(sid, `ing-${u}`),
    data: { file_type: "csv", filename: "roster.csv", content },
  });
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.data.batch_status).toBe("validation_failed");
  expect(body.data.counts).toMatchObject({ valid: 1, invalid: 1 });
  expect(body.data.students_written).toBe(0);

  // Fail-closed: a validation_failed batch cannot be submitted for lock (from-state guard).
  const sub = await request.post(`/api/school/roster/${batchId}/actions/submit`, { headers: SID(sid, `sub-${u}`), data: {} });
  expect((await sub.json()).ok).toBe(false);
});

test("forbidden government-id column rejects the whole upload (422)", async ({ request }) => {
  const { school, part } = await fixtures(request);
  test.skip(!school || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}-forb`;
  const batchId = await newBatch(request, sid, String(part!.id), u);

  const content = "student_name,grade,consent_obtained,aadhaar\n" + `X ${u},5,yes,123456789012\n`;
  const res = await request.post(`/api/school/roster/${batchId}/ingest`, {
    headers: SID(sid, `ing-${u}`),
    data: { file_type: "csv", filename: "roster.csv", content },
  });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(JSON.stringify(body.error)).toMatch(/Forbidden column/i);
});

test("un-ingested batch cannot be submitted for lock (status gate)", async ({ request }) => {
  const { school, part } = await fixtures(request);
  test.skip(!school || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}-gate`;
  const batchId = await newBatch(request, sid, String(part!.id), u);
  // batch is in 'uploaded' (never ingested) -> submit must be blocked by the from-state guard.
  const sub = await request.post(`/api/school/roster/${batchId}/actions/submit`, { headers: SID(sid, `sub-${u}`), data: {} });
  expect((await sub.json()).ok).toBe(false);
});

test("concurrent ingests on one batch: only one commits (status gate)", async ({ request }) => {
  const { school, part } = await fixtures(request);
  test.skip(!school || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}-conc`;
  const batchId = await newBatch(request, sid, String(part!.id), u);
  const content = csv([`Conc ${u} A,5,yes,A,${u}-R1`]);
  const fire = () => request.post(`/api/school/roster/${batchId}/ingest`, { headers: SID(sid, `ing-${u}-${Math.random()}`), data: { file_type: "csv", filename: "r.csv", content } });
  const [a, b] = await Promise.all([fire(), fire()]);
  const oks = [await a.json(), await b.json()].filter((x) => x.ok && x.data?.students_written > 0);
  // The status gate (uploaded -> validated) means at most one ingest commits students.
  expect(oks.length).toBeLessThanOrEqual(1);
});
