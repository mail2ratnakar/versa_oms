import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-MATERIAL-UPLOAD-2026-0040 — staff upload question-paper SETS (A-D) + the blank answer/OMR sheet into a
// material package; once released, schools download them time-gated. Fixture: E2E-PKG-RELEASED (released,
// release_at past) for school E2E-CH3-SCH.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const J = (k: string) => ({ "content-type": "application/json", "x-idempotency-key": k });

test("staff upload 4 question-paper sets + blank answer sheet -> school downloads them time-gated", async ({ request }) => {
  const sb = admin();
  const pkg = (await sb.from("exam_material_packages").select("id").eq("package_code", "E2E-PKG-RELEASED").maybeSingle()).data?.id as string | undefined;
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  test.skip(!pkg || !sch, "run seed_chain3.sql (E2E-PKG-RELEASED material fixtures)");
  const u = Date.now();
  const content = Buffer.from("%PDF-1.4 e2e question paper").toString("base64");

  // A question paper requires a set.
  const noSet = await request.post("/api/staff/exams/materials/upload", { headers: J(`ns-${u}`), data: { package_id: pkg, file_type: "question_paper", content, encoding: "base64" } });
  expect(noSet.status(), "question paper without a set is rejected").toBe(422);

  // Upload the 4 sets.
  for (const s of ["A", "B", "C", "D"]) {
    const j = (await (await request.post("/api/staff/exams/materials/upload", { headers: J(`qp${s}-${u}`), data: { package_id: pkg, file_type: "question_paper", set_code: s, content, encoding: "base64" } })).json()).data;
    expect(j.file_code, `set ${s} uploaded`).toMatch(new RegExp(`^MQP-SET${s}-`));
  }
  // Upload the blank answer/OMR sheet.
  const asJ = (await (await request.post("/api/staff/exams/materials/upload", { headers: J(`as-${u}`), data: { package_id: pkg, file_type: "answer_sheet", content, encoding: "base64" } })).json()).data;
  expect(asJ.file_code, "blank answer sheet uploaded").toMatch(/^MAS-/);

  // The school downloads an uploaded set, time-gated (released package -> signed URL).
  const fid = (await sb.from("exam_material_files").select("id").like("file_code", "MQP-SETA-%").order("created_at", { ascending: false }).limit(1).maybeSingle()).data?.id as string | undefined;
  const dl = await request.get(`/api/school/materials/${fid}/download`, { headers: { "x-dev-school": sch as string } });
  expect(dl.status(), "released material downloads").toBe(200);
  expect((await dl.json()).data.download_url, "signed URL issued").toBeTruthy();
});
