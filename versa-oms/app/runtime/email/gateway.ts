// FROZEN-KERNEL — the email gateway. Two channels (transactional + outreach), each provider chosen by env,
// so providers are PLUG-AND-PLAY. Generated services call these interfaces only — never a provider SDK.
//   TRANSACTIONAL_PROVIDER (default console) · OUTREACH_PROVIDER (default console)
import { BrevoAdapter } from "./adapters/brevo";
import { ConsoleAdapter } from "./adapters/console";

export type EmailMessage = { to: string; toName?: string; subject: string; html: string; params?: Record<string, unknown> };
export type Contact = { email: string; attributes?: Record<string, unknown> };
export type CampaignSpec = { name: string; subject: string; html: string; listId: string; scheduledAt?: string };
export type SendResult = { accepted: boolean; providerMessageId?: string; error?: string };
export type ImportResult = { listId: string; processId?: string; imported: number; failed: number };
// action = an email_sends lifecycle transition (mark_delivered / mark_opened / mark_bounced / ...)
export type WebhookEvent = { email: string; providerMessageId?: string; action: string };

export interface TransactionalProvider {
  sendTransactional(msg: EmailMessage): Promise<SendResult>;
}
export interface OutreachProvider {
  syncContacts(listName: string, contacts: Contact[]): Promise<ImportResult>;
  createCampaign(spec: CampaignSpec): Promise<{ campaignId: string }>;
  sendCampaign(campaignId: string): Promise<void>;
  normalizeWebhook(payload: unknown): WebhookEvent[];
}
export type Provider = TransactionalProvider & OutreachProvider;
export interface EmailGateway { transactional: TransactionalProvider; outreach: OutreachProvider; }

// Add a provider by dropping an adapter module here — nothing else changes (plug-and-play).
const ADAPTERS: Record<string, () => Provider> = {
  brevo: () => new BrevoAdapter(),
  console: () => new ConsoleAdapter(),
};
const make = (name: string): Provider => (ADAPTERS[name] || ADAPTERS.console)();

export function emailGateway(): EmailGateway {
  return {
    transactional: make((process.env.TRANSACTIONAL_PROVIDER || "console").toLowerCase()),
    outreach: make((process.env.OUTREACH_PROVIDER || "console").toLowerCase()),
  };
}
