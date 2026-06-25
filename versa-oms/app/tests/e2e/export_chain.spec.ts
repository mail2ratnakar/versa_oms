import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-011 Sensitive Export (FR-EXPORT-CHAIN-2026-0024). Request -> maker-checker approval (two distinct
// staff; self-approval cannot apply) -> generate a watermarked private file -> secure expiry-gated
// signed-URL download. Fixture: seed_chain3.sql (an active report_definition E2E-RPTDEF).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const J = (extra: Record<string, string> = {}) => ({ "content-type": "application/json", ...extra });
const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

test("sensitive export: maker-checker approve, generate private file, secure download, expiry, self-approval blocked", async ({ request }) => {
  const sb = admin();
  const def = (await sb.from("report_definitions").select("id").eq("report_status", "active").limit(1).maybeSingle()).data?.id as string | undefined;
  test.skip(!def, "run _validation/seed_chain3.sql (active report_definition)");
  const u = Date.now();
  const review = (rid: string, actor: string, key: string) => request.post(`/api/staff/reports/export-requests/${rid}/actions/start_review`, { headers: J({ "x-dev-actor": actor, "x-idempotency-key": key }), data: { reason: "review" } });
  const approve = (rid: string, actor: string, key: string) => request.post(`/api/staff/reports/export-requests/${rid}/actions/approve`, { headers: J({ "x-dev-actor": actor, "x-idempotency-key": key }), data: { reason: "approve" } });

  // Request (reason required; requested_by is server-set, never client).
  const cr = await (await request.post("/api/staff/reports/exports", { headers: J({ "x-idempotency-key": `c-${u}` }), data: { reason: "audit review", sensitivity_level: "restricted" } })).json();
  expect(cr.ok).toBe(true);
  expect(String(cr.data.export_code)).toMatch(/^EXP-/);
  const rid = String(cr.data.id);
  await review(rid, A, `sr-${u}`);

  // Maker-checker: the FIRST approval does not apply; a SECOND distinct approver applies.
  const a1 = await (await approve(rid, A, `a1-${u}`)).json();
  expect(a1.data.applied, "1st approval does not apply (maker-checker)").toBe(false);
  const a2 = await (await approve(rid, B, `a2-${u}`)).json();
  expect(a2.data.applied, "2nd distinct approver applies").toBe(true);
  expect(a2.data.export_status).toBe("approved");

  // Generate the private watermarked file.
  const g = await (await request.post(`/api/staff/reports/exports/${rid}/generate`, { headers: J({ "x-idempotency-key": `g-${u}` }), data: {} })).json();
  expect(g.ok).toBe(true);
  expect(String(g.data.file_code)).toMatch(/^EXPF-/);

  // Secure download -> short-lived signed URL.
  const d = await (await request.get(`/api/staff/reports/exports/${rid}/download`)).json();
  expect(d.ok, "download issued").toBe(true);
  expect(d.data.download_url, "signed URL").toBeTruthy();

  // Expiry gate: expire the file, the download is blocked.
  await sb.from("export_files").update({ expires_at: "2020-01-01T00:00:00Z" }).eq("export_request_id", rid);
  expect((await request.get(`/api/staff/reports/exports/${rid}/download`)).status(), "expired download blocked").toBe(409);

  // Self-approval can never reach two distinct approvers: a fresh request approved twice by the SAME actor stays unapproved.
  const cr2 = (await (await request.post("/api/staff/reports/exports", { headers: J({ "x-idempotency-key": `c2-${u}` }), data: { reason: "self-approval test" } })).json()).data;
  const rid2 = String(cr2.id);
  await review(rid2, C, `sr2-${u}`);
  await approve(rid2, C, `sa1-${u}`);
  const sa2 = await (await approve(rid2, C, `sa2-${u}`)).json();
  expect(sa2.data.applied, "the same actor cannot self-approve a two-person action").toBe(false);
});
