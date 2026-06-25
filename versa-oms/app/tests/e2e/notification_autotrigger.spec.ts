import { test, expect } from "@playwright/test";

// FR-NOTIFY-AUTOTRIGGER-2026-0017 — raising a notification event dispatches it immediately (outbox:
// persist then fan out best-effort; the drain endpoint is the backstop). Proven on the CRM path:
// recording a follow-up raises crm_followup_due, which is fanned WITHOUT any drain call.
// Fixture: seed_chain3.sql seeds an active crm_followup_due template (else the event would suppress).
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("auto-trigger: recording a CRM follow-up fans out immediately (no drain call)", async ({ request }) => {
  const u = `${Date.now()}`;

  const lead = (await (await request.post("/api/staff/schools/crm", {
    headers: STAFF(`lead-${u}`),
    data: { school_name: `E2E AutoFan ${u}`, city: "Pune", state: "Maharashtra", country: "India", lead_source: "referral" },
  })).json()).data?.lead as Record<string, unknown> | undefined;
  test.skip(!lead?.id, "CRM lead create unavailable");

  // Recording an interaction WITH a follow-up raises crm_followup_due events.
  const interaction = (await (await request.post(`/api/staff/schools/crm/${lead!.id}/interactions`, {
    headers: STAFF(`int-${u}`),
    data: { interaction_type: "call", summary: "Discussed the olympiad programme", next_followup_at: "2026-07-01T10:00:00Z" },
  })).json()).data as Record<string, unknown> | undefined;
  expect(interaction?.id, "interaction recorded").toBeTruthy();
  const interactionId = String(interaction!.id);

  // WITHOUT calling the drain endpoint, the raised event has already been fanned into a batch.
  const batches = (await (await request.get("/api/staff/notifications/batches?page_size=100")).json()).data.items as Array<Record<string, unknown>>;
  const autoBatch = batches.find((b) => b.batch_type === "event_triggered" && String(b.source_entity_id) === interactionId);
  expect(autoBatch, "raising the event auto-fanned it without a drain call").toBeTruthy();
  expect(autoBatch!.template_id, "rendered from the approved crm_followup_due template").toBeTruthy();
});
