import { test, expect } from "@playwright/test";

// FR-SECURE-FILE-DOWNLOAD-2026-0003 — the roster source file is stored privately on ingest and
// served as a short-lived SIGNED download URL (scope-checked + audited). Proves the signedUrl
// engine is now wired (was 0 routes). Fixture: seed_chain3.sql (E2E-CH3-SCH + E2E-PART-CH3).
const GET = (sid: string) => ({ "x-dev-school": sid, "x-request-id": Math.random().toString(36).slice(2) });
const POST = (sid: string, key: string) => ({ "content-type": "application/json", "x-dev-school": sid, "x-idempotency-key": key });
const csv = (rows: string[]) => "student_name,grade,consent_obtained,section,school_roll_number\n" + rows.join("\n") + "\n";

test("roster source file → private store → signed download; cross-school denied; no-file 409", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  const parts = (await (await request.get("/api/staff/core/participations?q=E2E-PART-CH3")).json()).data.items as Array<Record<string, unknown>>;
  const part = parts.find((p) => p.participation_code === "E2E-PART-CH3");
  test.skip(!school || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}`;

  // Create a batch + ingest a clean file (this stores the source file).
  const batchId = String((await (await request.post("/api/school/roster", { headers: POST(sid, `rf-${u}`), data: { participation_id: part!.id, source_type: "school_uploaded" } })).json()).data.id);
  const ing = await (await request.post(`/api/school/roster/${batchId}/ingest`, { headers: POST(sid, `rfi-${u}`), data: { file_type: "csv", filename: "roster.csv", content: csv([`File ${u} A,5,yes,A,${u}-R1`]) } })).json();
  expect(ing.ok).toBe(true);
  expect(ing.data.batch_status).toBe("validated");

  // Own school downloads -> a real signed URL + expiry (private bucket, short-lived).
  const dl = await (await request.get(`/api/school/roster/${batchId}/file`, { headers: GET(sid) })).json();
  expect(dl.ok).toBe(true);
  expect(typeof dl.data.download_url).toBe("string");
  expect(dl.data.download_url).toContain("/object/sign/"); // a real short-lived Supabase signed URL
  expect(dl.data.download_url).toContain("token=");
  expect(dl.data.object_path).toBeUndefined(); // raw object path is never returned as a field (skill 10)
  expect(dl.data.ttl_seconds).toBeGreaterThan(0);
  expect(dl.data.expires_at).toBeTruthy();

  // Cross-school IDOR: a different school cannot reach this batch's file (fail-closed -> 404).
  const allSchools = (await (await request.get("/api/staff/core/schools?page_size=100")).json()).data.items as Array<Record<string, unknown>>;
  const other = allSchools.find((s) => String(s.id) !== sid);
  if (other) {
    const x = await request.get(`/api/school/roster/${batchId}/file`, { headers: GET(String(other.id)) });
    expect(x.status()).toBe(404);
  }

  // A batch with no stored file (never ingested) -> 409, never a fake URL.
  const emptyId = String((await (await request.post("/api/school/roster", { headers: POST(sid, `rfe-${u}`), data: { participation_id: part!.id, source_type: "school_uploaded" } })).json()).data.id);
  const nf = await request.get(`/api/school/roster/${emptyId}/file`, { headers: GET(sid) });
  expect(nf.status()).toBe(409);
});
