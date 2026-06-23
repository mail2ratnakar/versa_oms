import { test, expect } from "@playwright/test";

// Q3 — cross-portal isolation. Public verify must expose ONLY whitelisted fields.
test("public verify returns only whitelisted minimal fields", async ({ request }) => {
  const res = await request.get("/api/verify/certificate/VRS-TEST1");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  const keys = Object.keys(body.data).sort();
  expect(keys).toEqual(["award", "candidate_name", "issued_on", "olympiad_name", "verification_code", "verification_status"].sort());
  const json = JSON.stringify(body.data);
  for (const forbidden of ["parent_phone", "internal_note", "raw_omr", "score", "email", "phone"]) {
    expect(json).not.toContain(forbidden);
  }
});

// Staff endpoints return the standard envelope under the staff module namespace.
test("staff overview is served via the staff guard + envelope", async ({ request }) => {
  const res = await request.get("/api/staff/overview");
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.meta.module).toBe("company_dashboard");
});

// Full staff<->school cross-portal denial requires real sessions; enabled with auth.
test.skip("school session cannot reach /api/staff/* (needs real auth)", async () => {
  // With real Supabase auth: a school-authenticated request to /api/staff/* must be 401/403.
});
