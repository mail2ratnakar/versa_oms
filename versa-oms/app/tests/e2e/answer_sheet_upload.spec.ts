import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-ANSWER-SHEET-UPLOAD-2026-0019 — the return half of exam distribution: a school uploads its
// administered answer sheets, which create an import batch (on the school's behalf) + ingest the OMR
// rows (reusing FR-OMR-IMPORT-0010), then appear in the school's list. Fixture: seed_chain3.sql
// (E2E-CH3-SCH with a participation -> olympiad -> exam cycle so the cycle resolves).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("school uploads answer sheets -> batch created + ingested + visible in its list", async ({ request }) => {
  const sb = admin();
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  test.skip(!sch, "run _validation/seed_chain3.sql");
  const u = Date.now();
  const csv = `candidate_id,Q1,Q2,Q3\nE2E-AS-${u}-1,A,B,C\nE2E-AS-${u}-2,B,C,D`;

  // Upload (UPSTREAM): creates the batch on the school's behalf + ingests the OMR rows.
  const res = await request.post("/api/school/answer-sheets", { headers: { "content-type": "application/json", "x-dev-school": sch! }, data: { content: csv } });
  expect(res.status(), "upload accepted").toBe(200);
  const body = await res.json();
  expect(body.data.imported, "both rows ingested").toBe(2);
  expect(body.data.batch_status, "batch validated").toBe("validated");
  const batchCode = String(body.data.import_batch_code);

  // Downstream visibility: the batch shows up in the school's own answer-sheet list.
  const list = (await (await request.get("/api/school/answer-sheets", { headers: { "x-dev-school": sch! } })).json()).data.items as Array<Record<string, unknown>>;
  expect(list.some((b) => b.import_batch_code === batchCode), "uploaded batch is listed").toBe(true);
});
