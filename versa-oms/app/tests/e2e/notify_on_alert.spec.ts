import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-INCIDENT-NOTIFY-2026-0035 / negative pack WF-015-NEG-006 — opening a security incident raises a
// notification event (so the security team is alerted), idempotent per incident.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("opening a security incident raises a notification event (WF-015-NEG-006)", async ({ request }) => {
  const sb = admin();
  const staff = (await sb.from("staff_profiles").select("id").eq("staff_code", "E2E-DRIFT").maybeSingle()).data as { id?: string } | null;
  test.skip(!staff?.id, "run seed_chain3.sql (drift fixture)");

  // Force a fresh incident so the notify path fires (notify is idempotent per incident).
  await sb.from("security_incidents").update({ status: "archived" }).eq("incident_type", "unauthorized_access").eq("status", "open").ilike("summary", "Permission drift detected%");

  const d = (await (await request.post("/api/staff/security-audit/drift-scan", { headers: { "content-type": "application/json", "x-idempotency-key": `na-${Date.now()}` }, data: {} })).json()).data;
  expect(d.incident_code, "a drift incident was opened").toBeTruthy();

  const ev = (await sb.from("notification_events").select("id, event_payload, source_module").eq("event_idempotency_key", `security_incident_opened:${d.incident_code}`).maybeSingle()).data as { id?: string; source_module?: string; event_payload?: { incident_code?: string } } | null;
  expect(ev?.id, "a notification event was raised for the incident").toBeTruthy();
  expect(ev?.source_module).toBe("security_audit_console");
  expect(ev?.event_payload?.incident_code).toBe(d.incident_code);
});
