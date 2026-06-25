import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-ANSWER-SHEET-UPLOAD-0019 + FR-ANSWER-SHEET-ROSTER-VALIDATION-0020 — a school uploads its administered
// answer sheets; candidate_ids are validated against its roster: known ones are ingested, unknown ones are
// rejected + surfaced. The batch then appears in the school's list. Fixture: seed_chain3.sql (E2E-CH3-SCH).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("school answer-sheet upload: known candidate_id ingested, unknown rejected, batch listed", async ({ request }) => {
  const sb = admin();
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  test.skip(!sch, "run _validation/seed_chain3.sql");

  // Ensure a roster candidate_id exists (canonical value — matches CHAIN-003's assignment, so it doesn't
  // depend on test order and doesn't disturb chain3's assertions).
  const students = (await sb.from("students").select("id, candidate_id, student_name").eq("school_id", sch!).like("student_name", "E2E CH3 Student%").order("student_name")).data as Array<Record<string, unknown>> | null;
  test.skip(!students || students.length < 1, "no E2E students seeded");
  let known = students!.find((s) => s.candidate_id)?.candidate_id as string | undefined;
  if (!known) {
    known = "E2ECH3SCH-00001";
    await sb.from("students").update({ candidate_id: known, status: "active" }).eq("id", students![0].id);
  }
  const unknownId = `FAKE-${Date.now()}`;
  const csv = `candidate_id,Q1,Q2,Q3\n${known},A,B,C\n${unknownId},B,C,D`;

  const res = await request.post("/api/school/answer-sheets", { headers: { "content-type": "application/json", "x-dev-school": sch! }, data: { content: csv } });
  expect(res.status(), "upload accepted").toBe(200);
  const body = await res.json();
  expect(body.data.imported, "only the rostered candidate is ingested").toBe(1);
  expect(body.data.unknown_candidate_ids, "the off-roster id is rejected + surfaced").toContain(unknownId);
  const batchCode = String(body.data.import_batch_code);

  // Downstream visibility: the batch is in the school's own list.
  const list = (await (await request.get("/api/school/answer-sheets", { headers: { "x-dev-school": sch! } })).json()).data.items as Array<Record<string, unknown>>;
  expect(list.some((b) => b.import_batch_code === batchCode), "uploaded batch is listed").toBe(true);
});
