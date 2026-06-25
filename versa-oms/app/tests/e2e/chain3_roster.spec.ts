import { test, expect } from "@playwright/test";

// CHAIN-003 — roster lock -> candidate IDs generated + students set eligible (active).
// Fixture: run `_validation/seed_chain3.sql` first (seeds E2E-ROSTER-CH3 + 2 students).
const json = { "content-type": "application/json" };

test("CHAIN-003: roster lock assigns candidate IDs + marks students active", async ({ request }) => {
  const batches = (await (await request.get("/api/staff/students/rosters?q=E2E-ROSTER-CH3")).json()).data.items as Array<Record<string, unknown>>;
  const batch = batches.find((b) => b.batch_code === "E2E-ROSTER-CH3");
  test.skip(!batch, "run _validation/seed_chain3.sql to seed the CHAIN-003 fixture");

  // Order-independent: lock only from a lockable state. The P0.1 guard correctly allows lock from
  // validated/submitted_for_lock and blocks re-lock once locked, so on a consumed fixture we assert
  // the persisted effect (candidate IDs + active students) rather than re-locking.
  if (String(batch!.batch_status) !== "locked") {
    const lock = await request.post(`/api/staff/students/rosters/${batch!.id}/actions/lock`, { headers: json, data: { reason: "roster verified" } });
    expect((await lock.json()).ok).toBe(true);
  }

  const students = (await (await request.get("/api/staff/core/students?q=E2E%20CH3%20Student")).json()).data.items as Array<Record<string, unknown>>;
  const seeded = students.filter((s) => String(s.student_name ?? "").startsWith("E2E CH3 Student"));
  expect(seeded.length).toBe(2);
  for (const s of seeded) {
    expect(s.candidate_id, "candidate_id assigned on lock").toBeTruthy();          // step 2
    expect(String(s.candidate_id)).toMatch(/^E2ECH3SCH-\d{5}$/);                    // school-code prefix + sequence
    expect(s.status).toBe("active");                                                // step 3 (eligibility)
  }
});

// FR-STUDENT-ROSTER-OPS-2026-0001 — precondition: a blocked school's roster cannot be locked.
test("CHAIN-003 precondition: cannot lock a roster for a blocked school", async ({ request }) => {
  const batches = (await (await request.get("/api/staff/students/rosters?q=E2E-ROSTER-BLOCKED")).json()).data.items as Array<Record<string, unknown>>;
  const blocked = batches.find((b) => b.batch_code === "E2E-ROSTER-BLOCKED");
  test.skip(!blocked, "run _validation/seed_chain3.sql to seed the blocked-school fixture");

  const res = await request.post(`/api/staff/students/rosters/${blocked!.id}/actions/lock`, { headers: { "content-type": "application/json" }, data: { reason: "attempt" } });
  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(JSON.stringify(body.error)).toContain("active"); // "School must be active to lock the roster."
});
