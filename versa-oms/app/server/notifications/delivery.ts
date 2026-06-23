/**
 * Notification delivery. In-app delivery is immediate and reliable; external
 * channels (email/SMS/WhatsApp) are queued for the provider — the same external-
 * credential step deferred alongside auth. Retry/dead-letter is handled by the
 * job runner. Pure logic here; the handler updates recipient rows.
 */
export type Channel = "in_app" | "email" | "sms" | "whatsapp";

export function deliver(channel: Channel): { status: "delivered" | "queued_external"; channel: Channel } {
  return { status: channel === "in_app" ? "delivered" : "queued_external", channel };
}

export function deliveryStats(channels: Channel[]): { delivered: number; queued_external: number; total: number } {
  const delivered = channels.filter((c) => c === "in_app").length;
  return { delivered, queued_external: channels.length - delivered, total: channels.length };
}
