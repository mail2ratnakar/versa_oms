// FROZEN-KERNEL — the notification feed, DERIVED from state (no new entity): scheduled campaigns become reminders,
// sent campaigns become notices. Served at /api/notifications and read by the nav-bar bell. Extend by adding cases.
import { db } from "@/runtime/db";

export async function notifications(): Promise<Array<{ text: string; when?: string; kind: string }>> {
  const out: Array<{ text: string; when?: string; kind: string }> = [];
  const camps = (await db.list("email_campaigns")) as Record<string, any>[];
  for (const c of camps) {
    const nm = c.name || c.campaign_code || "Campaign";
    if (c.status === "scheduled" && c.scheduled_at) out.push({ text: "“" + nm + "” is scheduled", when: c.scheduled_at, kind: "schedule" });
    else if (c.status === "sending" || c.status === "sent") out.push({ text: "“" + nm + "” sent to " + (c.sent_count || 0), kind: "sent" });
  }
  return out;
}
