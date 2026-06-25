import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-015 hardening — suspicious-login scan (FR-SUSPICIOUS-LOGIN-2026-0030). Repeated failed logins for one
// identity (brute force) raise a security alert and, at high risk, an incident. Idempotent. Fixture:
// seed_chain3.sql (6 failed logins for attacker@e2e.local).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const J = (k: string) => ({ "content-type": "application/json", "x-idempotency-key": k });

test("suspicious-login scan flags brute-force + opens a high-risk incident (idempotent)", async ({ request }) => {
  const sb = admin();
  const cnt = (await sb.from("staff_login_events").select("id", { count: "exact", head: true }).eq("email_attempted", "attacker@e2e.local").eq("event_type", "login_failed")).count;
  test.skip((cnt ?? 0) < 5, "run seed_chain3.sql (brute-force fixture: 6 failed logins for attacker@e2e.local)");
  const u = Date.now();

  const d = (await (await request.post("/api/staff/security-audit/login-scan", { headers: J(`ls-${u}`), data: {} })).json()).data;
  expect(d.alerts, "at least one suspicious identity").toBeGreaterThanOrEqual(1);
  expect(d.by_severity.high, "6 failures -> high severity").toBeGreaterThanOrEqual(1);
  expect(d.incident_code, "a high-risk incident is opened").toBeTruthy();

  const a = (await sb.from("security_alerts").select("alert_type, severity, alert_status").eq("alert_type", "brute_force").ilike("summary", "%attacker@e2e.local%").maybeSingle()).data as { severity?: string; alert_status?: string } | null;
  expect(a?.severity).toBe("high");
  expect(a?.alert_status).toBe("new");

  // Idempotent: re-scanning upserts the alert, it does not duplicate.
  await request.post("/api/staff/security-audit/login-scan", { headers: J(`ls2-${u}`), data: {} });
  const c = (await sb.from("security_alerts").select("id", { count: "exact", head: true }).eq("alert_type", "brute_force").ilike("summary", "%attacker@e2e.local%")).count;
  expect(c, "alert is upserted, not duplicated").toBe(1);
});
