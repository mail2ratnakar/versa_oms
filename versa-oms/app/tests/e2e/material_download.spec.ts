import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-MATERIAL-RELEASE-2026-0018 — a school securely downloads an exam-material file ONLY within the
// release window (released package + release_at passed), own-school only, audited. Fixture: seed_chain3.sql
// (E2E-PKG-RELEASED + E2E-MFILE-RELEASED [released, past] and E2E-PKG-SCHEDULED + E2E-MFILE-SCHEDULED
// [release_at future]). The test ensures the storage object exists so the signed URL is real.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("school exam-material download: time-gated + own-school + signed URL", async ({ request }) => {
  const sb = admin();
  await sb.storage.from("certificate-files").upload("e2e/material-qp.pdf", Buffer.from("%PDF-1.4\nE2E\n"), { contentType: "application/pdf", upsert: true });
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  const other = (await sb.from("schools").select("id").neq("school_code", "E2E-CH3-SCH").limit(1)).data?.[0]?.id as string | undefined;
  const f1 = (await sb.from("exam_material_files").select("id").eq("file_code", "E2E-MFILE-RELEASED").maybeSingle()).data?.id as string | undefined;
  const f2 = (await sb.from("exam_material_files").select("id").eq("file_code", "E2E-MFILE-SCHEDULED").maybeSingle()).data?.id as string | undefined;
  test.skip(!sch || !other || !f1 || !f2, "run _validation/seed_chain3.sql (exam-material fixtures)");

  // Released + within window -> a short-lived signed URL.
  const okRes = await request.get(`/api/school/materials/${f1}/download`, { headers: { "x-dev-school": sch! } });
  expect(okRes.status(), "released material downloads").toBe(200);
  const body = await okRes.json();
  expect(body.data.download_url, "signed URL issued").toBeTruthy();
  expect(body.data.ttl_seconds, "short-lived").toBeGreaterThan(0);

  // Scheduled (release_at in the future) -> blocked (no early access — leak prevention).
  expect((await request.get(`/api/school/materials/${f2}/download`, { headers: { "x-dev-school": sch! } })).status(), "not-yet-released blocked").toBe(403);

  // Another school cannot reach this school's material -> 404 (no leak).
  expect((await request.get(`/api/school/materials/${f1}/download`, { headers: { "x-dev-school": other! } })).status(), "cross-school 404").toBe(404);
});
