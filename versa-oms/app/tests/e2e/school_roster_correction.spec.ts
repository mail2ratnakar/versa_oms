import { test, expect } from "@playwright/test";

// School-side roster CORRECTION — the school requests a fix to a roster and submits it.
// create (draft) -> submit_correction (draft->submitted). School-scoped.
// Fixture: seed_chain3.sql (E2E-ROSTER-CH3 batch for the CH3 school).
const SID = (sid: string) => ({ "content-type": "application/json", "x-dev-school": sid });

test("school submits a roster correction (draft -> submitted)", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  test.skip(!school, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);

  const batches = (await (await request.get("/api/school/roster?page_size=200", { headers: { "x-dev-school": sid } })).json()).data.items as Array<Record<string, unknown>>;
  const batch = batches.find((b) => b.batch_code === "E2E-ROSTER-CH3");
  test.skip(!batch, "run _validation/seed_chain3.sql (roster batch)");

  const created = await (await request.post("/api/school/roster-corrections", {
    headers: { ...SID(sid), "x-idempotency-key": `corr-${sid}-${Date.now()}` },
    data: { roster_batch_id: batch!.id, correction_type: "edit_student", requested_change: { field: "grade", value: "6" }, reason: "wrong grade" },
  })).json();
  expect(created.ok).toBe(true);
  const id = created.data.id as string;
  expect(String(created.data.correction_code)).toMatch(/^CORR-/);

  const submitted = await (await request.post(`/api/school/roster-corrections/${id}/actions/submit`, { headers: SID(sid), data: {} })).json();
  expect(submitted.ok).toBe(true);
  expect(submitted.data.applied).toBe(true);
  expect(submitted.data.correction_status).toBe("submitted");
});
