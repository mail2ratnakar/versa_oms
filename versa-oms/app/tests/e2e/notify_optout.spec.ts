import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { createHash } from "node:crypto";

// FR-NOTIFY-OPTOUT-2026-0037 / negative pack WF-013-NEG-004 — an opted-out contact is suppressed from
// fan-out. Self-contained: raises its OWN school_activated event (unique marker) so it never races the
// shared fan-out fixture. Fixture: E2E-CH3-SCH (coordinator email) + active email template for school_activated.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const hash = (a: string) => createHash("sha256").update(a.trim().toLowerCase()).digest("hex");
const STAFF = (k: string) => ({ "content-type": "application/json", "x-idempotency-key": k });

test("an opted-out recipient is suppressed from fan-out (WF-013-NEG-004)", async ({ request }) => {
  const sb = admin();
  const school = (await sb.from("schools").select("id, coordinator_email").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data as { id?: string; coordinator_email?: string } | null;
  test.skip(!school?.id || !school.coordinator_email, "seed E2E-CH3-SCH needs a coordinator_email");
  const ch = hash(school!.coordinator_email as string);
  const marker = crypto.randomUUID();

  await sb.from("notification_preferences").delete().eq("recipient_contact_hash", ch);
  await sb.from("notification_preferences").insert({ recipient_contact_hash: ch, recipient_role: "school_coordinator", channel: "email", event_group: "lifecycle", is_enabled: false, suppression_reason: "e2e opt-out" });
  try {
    await sb.from("notification_events").insert({ event_code: "school_activated", event_idempotency_key: `E2E-OPTOUT-${marker}`, source_module: "school_onboarding_ops", source_entity: "schools", source_entity_id: marker, event_payload: { message: "opt-out test" }, recipient_resolver: "school_coordinator", school_id: school!.id, status: "created" });
    await request.post("/api/internal/notifications/fanout", { headers: STAFF(`oo-${Date.now()}`) });

    // The event fanned to a batch, but the opted-out coordinator was suppressed -> zero recipients.
    const batch = (await sb.from("notification_batches").select("id, recipient_count").eq("source_entity_id", marker).maybeSingle()).data as { id?: string; recipient_count?: number } | null;
    expect(batch?.id, "the event fanned to a batch").toBeTruthy();
    expect(batch?.recipient_count, "the opted-out coordinator is suppressed (0 recipients)").toBe(0);
  } finally {
    await sb.from("notification_preferences").delete().eq("recipient_contact_hash", ch);
  }
});
