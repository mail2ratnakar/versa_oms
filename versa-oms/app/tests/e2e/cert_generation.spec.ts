import { test, expect } from "@playwright/test";

// FR-CERT-GENERATION-2026-0004 — certificate identity is server-generated, publish makes it publicly
// verifiable, revoke reflects publicly. Fixture: seed_chain3.sql (E2E-CH3-SCH + 'E2E CH3 Student 1').
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("certificate: server-gen identity + persist, publish → public verify valid, revoke → revoked", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  const students = (await (await request.get("/api/staff/core/students?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const student = students.find((s) => s.student_name === "E2E CH3 Student 1");
  test.skip(!school || !student, "run _validation/seed_chain3.sql");
  const u = `${Date.now()}`;

  // Create — server overwrites the client-typed number + generates the code, and really persists.
  const created = await (await request.post("/api/staff/core/certificates", {
    headers: STAFF(`cert-${u}`),
    data: { student_id: student!.id, school_id: school!.id, certificate_number: "HACKED-001" },
  })).json();
  expect(created.ok).toBe(true);
  const cert = created.data;
  expect(String(cert.certificate_number)).toMatch(/^CERT-/);
  expect(String(cert.certificate_number)).not.toBe("HACKED-001"); // client value ignored (P2.4)
  expect(cert.status).not.toBe("created_local"); // persisted, not a local echo
  const code = String(cert.verification_code);
  expect(code).toMatch(/^VRS-/);

  // Before publish: not publicly verifiable.
  const pre = await (await request.get(`/api/verify/certificate/${code}`)).json();
  expect(pre.data.verification_status).toBe("not_found");

  // Publish → public_verification written; /verify returns 'valid' with the whitelisted candidate name.
  const pub = await (await request.post(`/api/staff/core/certificates/${cert.id}/actions/publish`, {
    headers: STAFF(`pub-${u}`), data: { reason: "approved for publication" },
  })).json();
  expect(pub.ok).toBe(true);
  const v = await (await request.get(`/api/verify/certificate/${code}`)).json();
  expect(v.data.verification_status).toBe("valid");
  expect(v.data.candidate_name).toBe("E2E CH3 Student 1");
  expect(v.data.student_id).toBeUndefined(); // never leak private ids

  // Revoke → /verify reflects 'revoked'.
  const rev = await (await request.post(`/api/staff/core/certificates/${cert.id}/actions/revoke`, {
    headers: STAFF(`rev-${u}`), data: { reason: "issued in error" },
  })).json();
  expect(rev.ok).toBe(true);
  const vr = await (await request.get(`/api/verify/certificate/${code}`)).json();
  expect(vr.data.verification_status).toBe("revoked");
});
