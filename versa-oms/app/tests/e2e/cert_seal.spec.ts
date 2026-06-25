import { test, expect } from "@playwright/test";

// FR-CERT-SEAL-2026-0011 — a published certificate's public_verification row is HMAC-sealed, and
// /verify reports integrity_verified. (Tamper detection is fully unit-tested in cert_seal.test.ts.)
// Fixture: seed_chain3.sql (E2E-CH3-SCH + 'E2E CH3 Student 1').
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("published certificate carries a verifiable digital seal", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  const students = (await (await request.get("/api/staff/core/students?q=E2E%20CH3%20Student%201")).json()).data.items as Array<Record<string, unknown>>;
  const student = students.find((s) => s.student_name === "E2E CH3 Student 1");
  test.skip(!school || !student, "run _validation/seed_chain3.sql");
  const u = `${Date.now()}`;

  const cert = (await (await request.post("/api/staff/core/certificates", { headers: STAFF(`cs-${u}`), data: { student_id: student!.id, school_id: school!.id } })).json()).data;
  const code = String(cert.verification_code);

  // Before publish: not publicly verifiable, integrity not asserted.
  const pre = await (await request.get(`/api/verify/certificate/${code}`)).json();
  expect(pre.data.integrity_verified).toBe(false);

  // Publish -> public_verification written + sealed.
  await request.post(`/api/staff/core/certificates/${cert.id}/actions/publish`, { headers: STAFF(`csp-${u}`), data: { reason: "publish" } });
  const v = await (await request.get(`/api/verify/certificate/${code}`)).json();
  expect(v.data.verification_status).toBe("valid");
  expect(v.data.integrity_verified).toBe(true); // the seal matches the stored public fields
});
