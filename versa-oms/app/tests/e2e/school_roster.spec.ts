import { test, expect } from "@playwright/test";

// School-side roster UPLOAD — the spine entry: a school uploads its student roster,
// creating a batch (workflow: upload_roster none->uploaded). Server generates batch_code
// + sets the 'uploaded' initial status. School-scoped. Fixture: seed_chain3.sql (CH3 school + participation).
const SID_HDR = (sid: string) => ({ "content-type": "application/json", "x-dev-school": sid });

test("school uploads its student roster (creates batch ROST-* in 'uploaded')", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  test.skip(!school, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);

  const parts = (await (await request.get("/api/staff/core/participations?q=E2E-PART-CH3")).json()).data.items as Array<Record<string, unknown>>;
  const part = parts.find((p) => p.participation_code === "E2E-PART-CH3");
  test.skip(!part, "run _validation/seed_chain3.sql (participation)");

  const res = await request.post("/api/school/roster", {
    headers: { ...SID_HDR(sid), "x-idempotency-key": `rost-${sid}` },
    data: { participation_id: part!.id, source_type: "school_uploaded" },
  });
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(String(body.data.batch_code)).toMatch(/^ROST-/);
  expect(body.data.batch_status).toBe("uploaded");
});
