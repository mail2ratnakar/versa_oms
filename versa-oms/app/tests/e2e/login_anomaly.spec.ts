import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-LOGIN-ANOMALY-2026-0033 — login anomalies. A single identity authenticating from many distinct IPs
// (impossible travel) or many devices (new device) raises alerts. Fixture: seed_chain3.sql (traveler@e2e.local
// with 4 IPs / 2 devices).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("login anomaly scan raises impossible-travel + new-device alerts", async ({ request }) => {
  const sb = admin();
  const cnt = (await sb.from("staff_login_events").select("id", { count: "exact", head: true }).eq("email_attempted", "traveler@e2e.local").eq("event_type", "login_success")).count;
  test.skip((cnt ?? 0) < 4, "run seed_chain3.sql (login anomaly fixture)");

  await request.post("/api/staff/security-audit/login-scan", { headers: { "content-type": "application/json", "x-idempotency-key": `la-${Date.now()}` }, data: {} });

  const it = (await sb.from("security_alerts").select("severity").eq("alert_type", "impossible_travel").ilike("summary", "%traveler@e2e.local%").maybeSingle()).data as { severity?: string } | null;
  expect(it?.severity, "impossible-travel alert at high severity (4 IPs)").toBe("high");

  const nd = (await sb.from("security_alerts").select("alert_type").eq("alert_type", "new_device").ilike("summary", "%traveler@e2e.local%").maybeSingle()).data as { alert_type?: string } | null;
  expect(nd?.alert_type, "new-device alert raised (2 devices)").toBe("new_device");
});
