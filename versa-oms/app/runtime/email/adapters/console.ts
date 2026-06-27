// FROZEN-KERNEL adapter — console (default). No real sends; logs + returns ids so the outreach flow runs in
// dev/CI without provider creds. Swap to brevo via env when ready.
import type { CampaignSpec, Contact, EmailMessage, ImportResult, OutreachProvider, SendResult, TransactionalProvider, WebhookEvent } from "../gateway";

const ref = (p: string) => p + "-" + (globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Date.now().toString(36));

export class ConsoleAdapter implements TransactionalProvider, OutreachProvider {
  async sendTransactional(msg: EmailMessage): Promise<SendResult> {
    console.log(`[email:console] transactional -> ${msg.to} :: ${msg.subject}`);
    return { accepted: true, providerMessageId: ref("msg") };
  }
  async syncContacts(listName: string, contacts: Contact[]): Promise<ImportResult> {
    console.log(`[email:console] synced ${contacts.length} contacts -> list '${listName}'`);
    return { listId: ref("list"), imported: contacts.length, failed: 0 };
  }
  async createCampaign(spec: CampaignSpec): Promise<{ campaignId: string }> {
    console.log(`[email:console] campaign '${spec.name}' -> list ${spec.listId}`);
    return { campaignId: ref("camp") };
  }
  async sendCampaign(campaignId: string): Promise<void> {
    console.log(`[email:console] sent campaign ${campaignId}`);
  }
  normalizeWebhook(payload: unknown): WebhookEvent[] {
    const p = (payload || {}) as Record<string, unknown>;
    return [{ email: String(p.email ?? ""), providerMessageId: p["message-id"] ? String(p["message-id"]) : undefined, action: "mark_delivered" }];
  }
}
