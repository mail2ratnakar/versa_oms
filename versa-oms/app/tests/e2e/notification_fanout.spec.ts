import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-NOTIFY-FANOUT-2026-0014 — the notification nervous system: a raised notification_event fans out
// into a batch of resolved recipients, rendered from an APPROVED template. An event with no active
// template is SUPPRESSED + surfaced (never bypassed — the required-template control is honored).
// Fixture: seed_chain3.sql (active template for school_activated + E2E-NEVENT-ACTIVATED [templated] +
// E2E-NEVENT-NOTMPL [no template]). The test resets those two events to 'created' so the drain is
// deterministic across runs (the events are consumed by fan-out).
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

function adminClient() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("fan-out: templated event -> queued batch with recipients; no-template event -> suppressed", async ({ request }) => {
  const sb = adminClient();
  const reset = await sb.from("notification_events").update({ status: "created" }).in("event_idempotency_key", ["E2E-NEVENT-ACTIVATED", "E2E-NEVENT-NOTMPL"]).select("id");
  test.skip(!reset.data || reset.data.length < 2, "run _validation/seed_chain3.sql (notification fixtures)");
  // Read the school's REAL coordinator email from the source of truth (not a hardcoded literal) so the
  // assertion proves address RESOLUTION, and survives any change to the seed value.
  const schoolRow = (await sb.from("schools").select("coordinator_email").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data as { coordinator_email?: string } | null;
  const expectedEmail = schoolRow?.coordinator_email;
  test.skip(!expectedEmail, "seed school E2E-CH3-SCH needs a coordinator_email");

  const drain = await (await request.post("/api/internal/notifications/fanout", { headers: STAFF(`fo-${Date.now()}`) })).json();
  expect(drain.ok).toBe(true);
  expect(drain.data.fanned).toBeGreaterThanOrEqual(1); // school_activated had an active template -> fanned
  expect(drain.data.suppressed).toBeGreaterThanOrEqual(1); // no-template event surfaced, NOT bypassed

  // A real event-driven batch (rendered from a resolved template) was created with a school recipient.
  const batches = (await (await request.get("/api/staff/notifications/batches?page_size=100")).json()).data.items as Array<Record<string, unknown>>;
  const eventBatches = batches.filter((b) => b.batch_type === "event_triggered");
  expect(eventBatches.length, "fan-out created an event batch").toBeGreaterThan(0);
  expect(eventBatches.every((b) => b.template_id), "every event batch renders from a template (control honored)").toBe(true);

  let schoolRecipient: Record<string, unknown> | undefined;
  for (const b of eventBatches.slice(0, 8)) {
    const recips = (await (await request.get(`/api/staff/notifications/batches/${b.id}/recipients`)).json()).data.items as Array<Record<string, unknown>>;
    schoolRecipient = recips.find((r) => r.recipient_type === "school_user");
    if (schoolRecipient) break;
  }
  expect(schoolRecipient, "a school recipient was resolved on an event batch").toBeTruthy();
  // FR-NOTIFY-CHANNEL-0016: the email-channel template resolves the school's REAL coordinator email
  // (compared to the value read from the source of truth above — not a hardcoded literal).
  expect(schoolRecipient!.channel, "email channel").toBe("email");
  expect(schoolRecipient!.channel_address, "resolved to the school's real coordinator email").toBe(expectedEmail);
});
