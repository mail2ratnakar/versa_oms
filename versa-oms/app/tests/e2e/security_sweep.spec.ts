import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-015 hardening (3/3) — scheduled security sweep (FR-SECURITY-SWEEP-2026-0029). The cron endpoint
// enqueues + runs BOTH the audit-integrity verify and the permission-drift scan, unattended, so the
// security checks run automatically (not only when a human clicks). Fixture: seed_chain3.sql (drift staff).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("scheduled security sweep runs the audit-verify + drift-scan jobs unattended", async ({ request }) => {
  const sb = admin();
  const staff = (await sb.from("staff_profiles").select("id").eq("staff_code", "E2E-DRIFT").maybeSingle()).data as { id?: string } | null;
  test.skip(!staff?.id, "run seed_chain3.sql (E2E-DRIFT drift fixture)");

  const r = await (await request.get("/api/cron/security-sweep")).json();
  expect(r.ok, "sweep ran").toBe(true);
  const ran = (r.ran as Array<{ jobType: string; status: string }>);
  const types = ran.map((x) => x.jobType);
  expect(types, "audit verify job ran").toContain("security.audit_hash_verify");
  expect(types, "drift scan job ran").toContain("security.permission_drift_scan");
  expect(ran.every((x) => x.status === "succeeded"), "both sweep jobs succeeded").toBe(true);

  // The drift scan (run unattended by the sweep) produced the finding for the deprecated role.
  const f = (await sb.from("permission_drift_findings").select("risk_level, finding_status").eq("role_or_permission_ref", "legacy_admin").eq("staff_user_id", staff!.id as string).maybeSingle()).data as { risk_level?: string } | null;
  expect(f?.risk_level, "sweep recorded the drift finding").toBe("high");
});
