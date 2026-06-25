import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-015 Security / Audit Drift (FR-SECURITY-AUDIT-VERIFY-2026-0026). The audit log is append-only +
// hash-chained. A forged/tampered audit row (bad event_hash) is detected by the integrity verifier, which
// opens a critical incident. The verifier reads the most-recent events, so a freshly-forged row is in window.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("audit integrity: a forged audit row is detected + a critical incident opened (audit log is immutable)", async ({ request }) => {
  const sb = admin();
  // Append a forged audit row (bad event_hash). The audit log is append-only — it can be inserted but
  // never updated/deleted, which is the immutability control; the verifier catches the bad hash.
  const u = Date.now();
  const forgedId = crypto.randomUUID();
  const ins = await sb.from("audit_events").insert({ id: forgedId, action: `security.E2E-FORGE-${u}`, entity_name: "schools", entity_id: "x", actor_role: "attacker", new_status: null, trace_id: crypto.randomUUID(), prev_hash: "genesis", event_hash: "forged000000000000000000000000000000" }).select("id");
  test.skip(!!ins.error, `could not append forged audit row: ${ins.error?.message}`);

  // The immutable audit log rejects tampering with existing rows.
  const upd = await sb.from("audit_events").update({ action: "tampered" }).eq("id", forgedId);
  expect(String(upd.error?.message ?? ""), "audit_events is append-only (UPDATE blocked)").toMatch(/append_only|forbidden/i);

  // The verifier detects the forged row and opens a critical incident.
  const d = (await (await request.get("/api/staff/security-audit/verify-chain")).json()).data;
  expect(d.ok, "integrity check fails when a forged row exists").toBe(false);
  expect(d.tampered_ids, "the forged row is detected").toContain(forgedId);
  expect(d.incident_code, "a critical security incident is opened").toBeTruthy();
});
