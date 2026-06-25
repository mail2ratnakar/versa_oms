import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-AUTO-LOCK-2026-0034 — an active, non-super-admin staff with >= 10 failed logins is auto-suspended by
// the login scan (protective), with an access event. Fixture: seed_chain3.sql (locktarget@e2e.local + 12 fails).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("a non-super-admin account is auto-locked after >= 10 failed logins (FR-AUTO-LOCK-2026-0034)", async ({ request }) => {
  const sb = admin();
  const staff = (await sb.from("staff_profiles").select("id, primary_role").eq("email", "locktarget@e2e.local").maybeSingle()).data as { id?: string; primary_role?: string } | null;
  const fails = (await sb.from("staff_login_events").select("id", { count: "exact", head: true }).eq("email_attempted", "locktarget@e2e.local").eq("event_type", "login_failed")).count ?? 0;
  test.skip(!staff?.id || staff.primary_role === "super_admin" || fails < 10, "run seed_chain3.sql (auto-lock fixture)");

  // Reset to active so the test is repeatable.
  await sb.from("staff_profiles").update({ staff_status: "active" }).eq("id", staff!.id as string);

  const d = (await (await request.post("/api/staff/security-audit/login-scan", { headers: { "content-type": "application/json", "x-idempotency-key": `al-${Date.now()}` }, data: {} })).json()).data;
  expect(d.auto_locked, "at least one account auto-locked").toBeGreaterThanOrEqual(1);

  const after = (await sb.from("staff_profiles").select("staff_status").eq("id", staff!.id as string).maybeSingle()).data as { staff_status?: string } | null;
  expect(after?.staff_status, "the brute-forced account is suspended").toBe("suspended");

  const ev = (await sb.from("staff_access_events").select("event_code").eq("staff_profile_id", staff!.id as string).eq("event_code", "auto_locked").limit(1).maybeSingle()).data as { event_code?: string } | null;
  expect(ev?.event_code, "an auto-lock access event was recorded").toBe("auto_locked");
});
