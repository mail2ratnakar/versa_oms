// FROZEN-KERNEL — orchestrates an outreach campaign through the EmailGateway. gen_services calls this from
// email_campaigns.start_send (declared service_hook). Generated code stays thin; the integration lives here.
import { db } from "@/runtime/db";
import { emailGateway } from "./gateway";

export async function sendCampaign(campaignId: string): Promise<void> {
  const camp = (await db.get("email_campaigns", campaignId)) as Record<string, any> | null;
  if (!camp) return;
  const gw = emailGateway();
  // target the directory: prospect/lead schools with an email, not unsubscribed (suppression)
  const schools = ((await db.list("schools")) as Record<string, any>[])
    .filter((s) => s.coordinator_email && !s.unsubscribed && ["prospect", "lead"].includes(s.status));
  const contacts = schools.map((s) => ({ email: s.coordinator_email as string, attributes: { name: s.name, state: s.state } }));
  const list = await gw.outreach.syncContacts("Campaign " + (camp.campaign_code || campaignId), contacts);
  const gwCamp = await gw.outreach.createCampaign({ name: camp.name, subject: camp.subject, html: camp.html_content, listId: list.listId });
  await gw.outreach.sendCampaign(gwCamp.campaignId);
  // record one email_sends (queued) per recipient for tracking; update campaign counts
  for (const s of schools) {
    await db.insert("email_sends", { send_ref: "SND-" + crypto.randomUUID().slice(0, 8).toUpperCase(), campaign_id: campaignId, school_id: s.id, email: s.coordinator_email, status: "queued" });
  }
  await db.update("email_campaigns", campaignId, { sent_count: schools.length });
}
