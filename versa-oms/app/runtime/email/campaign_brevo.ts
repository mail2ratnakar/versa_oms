// FROZEN-KERNEL — Mode B: create the campaign in Brevo (sync targets as a list + create the campaign shell)
// so the user finishes the design + sends in Brevo's editor; we store the provider ids. Called by
// email_campaigns.create_in_brevo. The send itself happens in Brevo; tracking flows back via the webhook.
import { db } from "@/runtime/db";
import { emailGateway } from "./gateway";
import { targetSchools, mergeTags } from "./campaign_sender";

export async function createInBrevo(campaignId: string): Promise<void> {
  const camp = (await db.get("email_campaigns", campaignId)) as Record<string, any> | null;
  if (!camp) return;
  const gw = emailGateway();
  const schools = targetSchools((await db.list("schools")) as Record<string, any>[], camp);
  const contacts = schools.map((s) => ({ email: s.coordinator_email as string, attributes: { SCHOOL_NAME: s.name, CITY: s.city, STATE: s.state } }));
  const list = await gw.outreach.syncContacts("Campaign " + (camp.campaign_code || campaignId), contacts);
  const gwCamp = await gw.outreach.createCampaign({ name: camp.name, subject: mergeTags(camp.subject || camp.name), html: mergeTags(camp.html_content || "<p>Designed in Brevo.</p>"), listId: list.listId });
  const id = gwCamp.campaignId;
  const url = id && !id.startsWith("console") ? "https://app.brevo.com/camp/template/" + id + "/message-setup" : "";
  await db.update("email_campaigns", campaignId, { provider_campaign_id: id, provider_url: url, sent_count: schools.length });
}
