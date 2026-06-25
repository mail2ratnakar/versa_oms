import { test, expect } from "@playwright/test";

// FR-CERT-PDF-2026-0005 — generate renders + privately stores the certificate PDF; staff + the owning
// school download it via a short-lived signed URL. Fixture: seed_chain3.sql (E2E-CH3-SCH + students).
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("certificate PDF: generate stores a PDF; secure signed download for staff + school; cross-school denied; pre-gen 409", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  const students = (await (await request.get("/api/staff/core/students?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const student = students.find((s) => s.student_name === "E2E CH3 Student 1");
  test.skip(!school || !student, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}`;

  const cert = (await (await request.post("/api/staff/core/certificates", {
    headers: STAFF(`cp-${u}`), data: { student_id: student!.id, school_id: sid },
  })).json()).data;
  const cid = String(cert.id);

  // Before generation: no PDF -> 409 (never a fake URL).
  const pre = await request.get(`/api/staff/core/certificates/${cid}/file`);
  expect(pre.status()).toBe(409);

  // Generate -> renders + stores the PDF, links pdf_file.
  const gen = await (await request.post(`/api/staff/core/certificates/${cid}/actions/generate`, { headers: STAFF(`cpg-${u}`), data: {} })).json();
  expect(gen.ok).toBe(true);

  // Staff downloads the PDF via a real short-lived signed URL.
  const sdl = await (await request.get(`/api/staff/core/certificates/${cid}/file`)).json();
  expect(sdl.ok).toBe(true);
  expect(String(sdl.data.download_url)).toContain("/object/sign/");
  expect(String(sdl.data.download_url)).toContain("certificate-files");
  expect(sdl.data.ttl_seconds).toBeGreaterThan(0);

  // Publish so the school can see it (school gate = published/downloaded).
  await request.post(`/api/staff/core/certificates/${cid}/actions/publish`, { headers: STAFF(`cpp-${u}`), data: { reason: "publish" } });

  // The owning school downloads its certificate PDF.
  const school_dl = await (await request.get(`/api/school/certificates/${cid}/file`, { headers: { "x-dev-school": sid } })).json();
  expect(school_dl.ok).toBe(true);
  expect(String(school_dl.data.download_url)).toContain("/object/sign/");

  // Cross-school IDOR: another school cannot reach this certificate's PDF.
  const allSchools = (await (await request.get("/api/staff/core/schools?page_size=100")).json()).data.items as Array<Record<string, unknown>>;
  const other = allSchools.find((s) => String(s.id) !== sid);
  if (other) {
    const x = await request.get(`/api/school/certificates/${cid}/file`, { headers: { "x-dev-school": String(other.id) } });
    expect(x.status()).toBe(404);
  }
});
