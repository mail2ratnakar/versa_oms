import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-MATERIAL-WINDOW-2026-0041 — download WINDOW END + exceptions. The window closes after expires_at;
// on a school postponing, ops EXTEND it (re-opens); on cancelling, ops CANCEL it (revoked -> blocked).
// Dedicated fixture E2E-PKG-WINDOW (released, no expiry) so it never races the other material tests.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const J = (k: string) => ({ "content-type": "application/json", "x-idempotency-key": k });

test("material download window: closes after expiry, extends on postpone, cancels on exam cancel", async ({ request }) => {
  const sb = admin();
  const pkg = (await sb.from("exam_material_packages").select("id").eq("package_code", "E2E-PKG-WINDOW").maybeSingle()).data?.id as string | undefined;
  const fid = (await sb.from("exam_material_files").select("id").eq("file_code", "E2E-MFILE-WINDOW").maybeSingle()).data?.id as string | undefined;
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  test.skip(!pkg || !fid || !sch, "run seed_chain3.sql (E2E-PKG-WINDOW window fixture)");
  const u = Date.now();
  const win = (data: Record<string, unknown>) => request.post(`/api/staff/exams/materials/packages/${pkg}/window`, { headers: J(`w-${u}-${Math.random()}`), data });
  const dlStatus = async () => (await request.get(`/api/school/materials/${fid}/download`, { headers: { "x-dev-school": sch as string } })).status();

  try {
    // Open (no expiry) -> the gate allows (200 with object, or 409 if the object is absent; never 403).
    expect([200, 409], "open window: gate allows").toContain(await dlStatus());

    // Close the window (expires in the past) -> blocked.
    expect((await win({ action: "extend", expires_at: "2020-06-01T00:00:00Z", reason: "close" })).ok()).toBe(true);
    const closed = await request.get(`/api/school/materials/${fid}/download`, { headers: { "x-dev-school": sch as string } });
    expect(closed.status(), "after expiry -> blocked").toBe(403);
    expect((await closed.json()).error.message).toMatch(/window.*closed/i);

    // Postpone -> extend the window into the future -> re-opens.
    expect((await win({ action: "extend", expires_at: "2999-01-01T00:00:00Z", reason: "exam postponed" })).ok()).toBe(true);
    expect([200, 409], "after postpone: re-opened").toContain(await dlStatus());

    // Cancel the exam -> package revoked -> blocked.
    expect((await win({ action: "cancel", reason: "school cancelled exam" })).ok()).toBe(true);
    const cancelled = await request.get(`/api/school/materials/${fid}/download`, { headers: { "x-dev-school": sch as string } });
    expect(cancelled.status(), "after cancel -> blocked").toBe(403);
    expect((await cancelled.json()).error.message).toMatch(/revoked|cancelled/i);
  } finally {
    await sb.from("exam_material_packages").update({ package_status: "released", release_at: "2020-01-01T00:00:00Z", expires_at: null }).eq("id", pkg as string);
  }
});
