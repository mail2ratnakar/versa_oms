import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-015 hardening — permission drift (FR-PERMISSION-DRIFT-2026-0027). A staff member still holding a
// role that is no longer active (deprecated) is drift; the scan flags it (with the role's risk) and opens
// a high-risk incident. Idempotent. Fixture: seed_chain3.sql (deprecated legacy_admin + E2E-DRIFT staff).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const J = (k: string) => ({ "content-type": "application/json", "x-idempotency-key": k });

test("permission drift: a staff holding a deprecated role is flagged + a high-risk incident opened", async ({ request }) => {
  const sb = admin();
  const role = (await sb.from("portal_roles").select("role_status").eq("role_id", "legacy_admin").maybeSingle()).data as { role_status?: string } | null;
  const staff = (await sb.from("staff_profiles").select("id").eq("staff_code", "E2E-DRIFT").maybeSingle()).data as { id?: string } | null;
  test.skip(!role || role.role_status === "active" || !staff?.id, "run seed_chain3.sql (deprecated legacy_admin + E2E-DRIFT staff)");
  const staffId = staff!.id as string;
  const u = Date.now();

  const d = (await (await request.post("/api/staff/security-audit/drift-scan", { headers: J(`ds-${u}`), data: {} })).json()).data;
  expect(d.findings, "at least one drift finding").toBeGreaterThanOrEqual(1);
  expect(d.by_risk.high, "a high-risk finding (the deprecated role's risk)").toBeGreaterThanOrEqual(1);
  expect(d.incident_code, "a high-risk incident is opened").toBeTruthy();

  // The finding persisted for that staff's deprecated role.
  const f = (await sb.from("permission_drift_findings").select("risk_level, finding_status").eq("role_or_permission_ref", "legacy_admin").eq("staff_user_id", staffId).maybeSingle()).data as { risk_level?: string; finding_status?: string } | null;
  expect(f?.risk_level).toBe("high");
  // A high-risk finding is open, or advanced to remediation_task_created once its task is raised (FR-REMEDIATION-TASK-0036).
  expect(["open", "remediation_task_created"]).toContain(f?.finding_status);

  // Idempotent: re-scanning upserts, it does not duplicate the finding.
  await request.post("/api/staff/security-audit/drift-scan", { headers: J(`ds2-${u}`), data: {} });
  const cnt = (await sb.from("permission_drift_findings").select("id", { count: "exact", head: true }).eq("role_or_permission_ref", "legacy_admin").eq("staff_user_id", staffId)).count;
  expect(cnt, "finding is upserted, not duplicated").toBe(1);
});
