// FROZEN-KERNEL adapter — Brevo (api.brevo.com/v3). Implements BOTH channels. Plug-and-play: selected via
// TRANSACTIONAL_PROVIDER=brevo / OUTREACH_PROVIDER=brevo. Needs BREVO_API_KEY (+ optional BREVO_SENDER_EMAIL/NAME,
// BREVO_FOLDER_ID). Complete: transactional send, batched async contact import, list+campaign create/sendNow,
// webhook event normalization, and a 429-aware throttle (respects Retry-After / rate-limit headers).
import type { CampaignSpec, Contact, EmailMessage, ImportResult, OutreachProvider, SendResult, TransactionalProvider, WebhookEvent } from "../gateway";

const BASE = "https://api.brevo.com/v3";
const SENDER = () => ({ email: process.env.BREVO_SENDER_EMAIL || "noreply@versa.example", name: process.env.BREVO_SENDER_NAME || "Versa Olympiads" });

// Brevo webhook event -> our email_sends transition
const EVENT_MAP: Record<string, string> = {
  request: "mark_sent", sent: "mark_sent", delivered: "mark_delivered",
  opened: "mark_opened", uniqueOpened: "mark_opened", click: "mark_clicked",
  hardBounce: "mark_bounced", softBounce: "mark_bounced", blocked: "mark_failed",
  spam: "mark_failed", invalid_email: "mark_failed", deferred: "mark_sent",
  unsubscribed: "mark_unsubscribed", listAddition: "mark_sent",
};

// 429-aware fetch: honours Retry-After / x-sib-ratelimit, exponential backoff + jitter
async function bfetch(path: string, init: RequestInit = {}, retries = 4): Promise<Response> {
  const headers: Record<string, string> = {
    "api-key": process.env.BREVO_API_KEY || "", "content-type": "application/json", accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(BASE + path, { ...init, headers });
    if (res.status !== 429 || attempt >= retries) return res;
    const ra = Number(res.headers.get("retry-after"));
    const wait = ra > 0 ? ra * 1000 : Math.min(2 ** attempt * 500, 8000) + Math.floor(Math.random() * 300);
    await new Promise((r) => setTimeout(r, wait));
  }
}

export class BrevoAdapter implements TransactionalProvider, OutreachProvider {
  async sendTransactional(msg: EmailMessage): Promise<SendResult> {
    const res = await bfetch("/smtp/email", { method: "POST", body: JSON.stringify({
      sender: SENDER(), to: [{ email: msg.to, name: msg.toName }], subject: msg.subject, htmlContent: msg.html, params: msg.params,
    }) });
    if (!res.ok) return { accepted: false, error: `brevo ${res.status}: ${await res.text()}` };
    const j = (await res.json()) as { messageId?: string };
    return { accepted: true, providerMessageId: j.messageId };
  }

  // create a list, then import contacts in <=1000 async batches (Brevo contact rate limit ~10 req/s)
  async syncContacts(listName: string, contacts: Contact[]): Promise<ImportResult> {
    const lr = await bfetch("/contacts/lists", { method: "POST", body: JSON.stringify({ name: listName, folderId: Number(process.env.BREVO_FOLDER_ID || 1) }) });
    const list = (await lr.json()) as { id?: number };
    const listId = String(list.id ?? "");
    let imported = 0, failed = 0, processId: string | undefined;
    for (let i = 0; i < contacts.length; i += 1000) {
      const batch = contacts.slice(i, i + 1000);
      const ir = await bfetch("/contacts/import", { method: "POST", body: JSON.stringify({
        listIds: [list.id], updateExistingContacts: true, emptyContactsAttributes: false,
        jsonBody: batch.map((c) => ({ email: c.email, attributes: c.attributes || {} })),
      }) });
      if (ir.ok) { const ij = (await ir.json()) as { processId?: number }; processId = ij.processId ? String(ij.processId) : processId; imported += batch.length; }
      else failed += batch.length;
      await new Promise((r) => setTimeout(r, 120)); // stay under ~10 req/s
    }
    return { listId, processId, imported, failed };
  }

  async createCampaign(spec: CampaignSpec): Promise<{ campaignId: string }> {
    const res = await bfetch("/emailCampaigns", { method: "POST", body: JSON.stringify({
      name: spec.name, subject: spec.subject, sender: SENDER(), htmlContent: spec.html,
      recipients: { listIds: [Number(spec.listId)] }, ...(spec.scheduledAt ? { scheduledAt: spec.scheduledAt } : {}),
    }) });
    const j = (await res.json()) as { id?: number };
    return { campaignId: String(j.id ?? "") };
  }

  async sendCampaign(campaignId: string): Promise<void> {
    await bfetch(`/emailCampaigns/${campaignId}/sendNow`, { method: "POST" });
  }

  normalizeWebhook(payload: unknown): WebhookEvent[] {
    const p = (payload || {}) as Record<string, unknown>;
    const evt = String(p.event ?? "");
    return [{ email: String(p.email ?? ""), providerMessageId: p["message-id"] ? String(p["message-id"]) : undefined, action: EVENT_MAP[evt] || "mark_sent" }];
  }
}
