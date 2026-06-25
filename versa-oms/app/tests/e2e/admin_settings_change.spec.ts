import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-014 Admin Setting Change Governance (FR-ADMIN-SETTINGS-CHAIN-2026-0025). Propose a setting change ->
// maker-checker approve (two distinct staff) -> maker-checker apply (two distinct staff) -> the new
// setting version is ACTIVATED and the previous one SUPERSEDED. Fixture: seed_chain3.sql (E2E-SETKEY + v1).
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

test("admin settings: propose -> maker-checker approve + apply -> new version active, old superseded", async ({ request }) => {
  const sb = admin();
  const def = (await sb.from("setting_definitions").select("setting_key").eq("setting_key", "E2E-SETKEY").eq("definition_status", "active").maybeSingle()).data?.setting_key as string | undefined;
  test.skip(!def, "run _validation/seed_chain3.sql (E2E-SETKEY)");
  const u = Date.now();
  const newValue = `on-${u}`;

  // Propose a change (requested_by is server-set).
  const cr = await (await request.post("/api/staff/admin/settings/changes", { headers: J({ "x-idempotency-key": `p-${u}` }), data: { setting_key: "E2E-SETKEY", new_value: newValue, reason: "enable feature" } })).json();
  expect(cr.ok, "change proposed").toBe(true);
  expect(String(cr.data.change_request_code)).toMatch(/^SCR-/);
  const rid = String(cr.data.id);
  const T = (action: string, actor: string, key: string) => request.post(`/api/staff/admin/settings/change-requests/${rid}/actions/${action}`, { headers: J({ "x-dev-actor": actor, "x-idempotency-key": key }), data: { reason: action } });

  await T("start_review", A, `sr-${u}`);
  // Maker-checker APPROVE (two distinct staff).
  const ap1 = await (await T("approve", A, `ap1-${u}`)).json();
  expect(ap1.data.applied, "1st approve does not apply").toBe(false);
  const ap2 = await (await T("approve", B, `ap2-${u}`)).json();
  expect(ap2.data.applied && ap2.data.request_status === "approved", "2nd distinct approver -> approved").toBe(true);

  // Maker-checker APPLY (two distinct staff) -> activation effect runs.
  await T("apply", A, `apl1-${u}`);
  const apl2 = await (await T("apply", B, `apl2-${u}`)).json();
  expect(apl2.data.applied && apl2.data.request_status === "applied", "2nd distinct applier -> applied").toBe(true);

  // The proposed version is now ACTIVE and the previous is SUPERSEDED.
  const versions = (await sb.from("setting_versions").select("setting_version, version_status, setting_value").eq("setting_key", "E2E-SETKEY").order("setting_version", { ascending: false })).data as Array<Record<string, unknown>>;
  const active = versions.find((v) => v.version_status === "active");
  expect(active?.setting_value, "the newly-applied value is active").toBe(newValue);
  expect(versions.filter((v) => v.version_status === "active").length, "exactly one active version").toBe(1);
  expect(versions.some((v) => v.version_status === "superseded"), "a previous version was superseded").toBe(true);
});
