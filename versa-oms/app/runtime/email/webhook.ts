// FROZEN-KERNEL — inbound provider webhook -> email_sends tracking. The dev server (and a Next.js
// app/api/webhooks/email/route.ts) POST the raw provider payload here. Provider-agnostic: the active outreach
// adapter normalizes the event; we set the send's status directly (provider is authoritative, tolerant of order).
import { db } from "@/runtime/db";
import { emailGateway } from "./gateway";

export async function handleEmailWebhook(payload: unknown): Promise<{ updated: number }> {
  const events = emailGateway().outreach.normalizeWebhook(payload);
  const sends = (await db.list("email_sends")) as Record<string, any>[];
  let updated = 0;
  for (const ev of events) {
    const match = (ev.providerMessageId && sends.find((s) => s.provider_message_id === ev.providerMessageId))
      || [...sends].reverse().find((s) => s.email === ev.email);
    if (!match) continue;
    const status = ev.action.replace(/^mark_/, "");                 // mark_delivered -> delivered
    const patch: Record<string, unknown> = { status };
    if (["sent", "delivered", "opened"].includes(status)) patch[status + "_at"] = new Date().toISOString();
    if (ev.providerMessageId) patch.provider_message_id = ev.providerMessageId;
    await db.update("email_sends", match.id, patch);
    updated++;
  }
  return { updated };
}
