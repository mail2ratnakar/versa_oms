import { test, expect } from "@playwright/test";

// CHAIN-003 — roster lock -> candidate IDs generated + students set eligible (active).
// Fixture: run `_validation/seed_chain3.sql` first (seeds E2E-ROSTER-CH3 + 2 students).
const json = { "content-type": "application/json" };

test("CHAIN-003: roster lock assigns candidate IDs + marks students active", async ({ request }) => {
  const batches = (await (await request.get("/api/staff/students/rosters?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const batch = batches.find((b) => b.batch_code === "E2E-ROSTER-CH3");
  test.skip(!batch, "run _validation/seed_chain3.sql to seed the CHAIN-003 fixture");

  const lock = await request.post(`/api/staff/students/rosters/${batch!.id}/actions/lock`, { headers: json, data: { reason: "roster verified" } });
  expect((await lock.json()).ok).toBe(true);

  const students = (await (await request.get("/api/staff/core/students?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const seeded = students.filter((s) => String(s.student_name ?? "").startsWith("E2E CH3 Student"));
  expect(seeded.length).toBe(2);
  for (const s of seeded) {
    expect(s.candidate_id, "candidate_id assigned on lock").toBeTruthy();          // step 2
    expect(String(s.candidate_id)).toMatch(/^E2ECH3SCH-\d{5}$/);                    // school-code prefix + sequence
    expect(s.status).toBe("active");                                                // step 3 (eligibility)
  }
});
