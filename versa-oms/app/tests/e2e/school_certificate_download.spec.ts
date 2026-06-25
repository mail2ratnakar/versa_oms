import { test, expect } from "@playwright/test";

// School-side certificate DOWNLOAD — read + gated artifact URL (not a transition).
// GET /api/school/certificates/[id]/download -> { download_url } (verification_url),
// gated by status (published/downloaded/verified), audited, school-scoped.
// Fixture: seed_chain3.sql (E2E-CERT-CH5, published).
test("school downloads its published certificate (-> verification url)", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  test.skip(!school, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);

  const items = (await (await request.get("/api/school/certificates?q=E2E-CERT-CH5", { headers: { "x-dev-school": sid } })).json()).data.items as Array<Record<string, unknown>>;
  const cert = items.find((c) => c.certificate_number === "E2E-CERT-CH5");
  expect(cert, "published certificate visible to the school").toBeTruthy();

  const res = await request.get(`/api/school/certificates/${cert!.id}/download`, { headers: { "x-dev-school": sid } });
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(String(body.data.download_url)).toContain("verify");
});
