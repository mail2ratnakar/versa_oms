// FROZEN-KERNEL — Mode A: send a campaign from here. gen_services calls sendCampaign from email_campaigns.
// start_send. Targets the campaign's selected schools (target_ids from the directory) or, if none, all
// prospect/lead. Merge tags ({{school_name}} etc.) map to Brevo contact attributes for per-recipient personalization.
import { db } from "@/runtime/db";
import { emailGateway } from "./gateway";

// who a campaign sends to: its explicit target_ids (directory selection), else all prospect/lead with an email.
export function targetSchools(all: Record<string, any>[], camp: Record<string, any>): Record<string, any>[] {
  let ids: string[] | null = null;
  try { ids = camp.target_ids ? JSON.parse(camp.target_ids) : null; } catch { ids = null; }
  const ok = (s: Record<string, any>) => s.coordinator_email && !s.unsubscribed;
  if (ids && ids.length) return all.filter((s) => ids!.includes(s.id) && ok(s));
  return all.filter((s) => ok(s) && ["prospect", "lead"].includes(s.status));
}

// friendly merge tags -> Brevo contact-attribute syntax (Brevo personalizes per recipient)
export function mergeTags(str: string): string {
  return String(str || "")
    .replace(/\{\{\s*school_name\s*\}\}/gi, "{{contact.SCHOOL_NAME}}")
    .replace(/\{\{\s*city\s*\}\}/gi, "{{contact.CITY}}")
    .replace(/\{\{\s*state\s*\}\}/gi, "{{contact.STATE}}");
}

// hosted-URLs-first attachments: each non-empty line is "Name | URL" (or a bare URL). Rendered as a download
// footer appended to the body — provider-agnostic and deliverability-safe (a link, not a MIME blob).
export function parseAttachments(text: string): Array<{ name: string; url: string }> {
  return String(text || "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf("|");
    return i >= 0 ? { name: l.slice(0, i).trim(), url: l.slice(i + 1).trim() } : { name: l.split("/").pop() || l, url: l };
  }).filter((a) => a.url);
}
export function attachmentsFooter(text: string): string {
  const a = parseAttachments(text);
  if (!a.length) return "";
  return '<div style="margin-top:24px;padding-top:12px;border-top:1px solid #eee;font-family:system-ui;font-size:13px"><strong>Attachments</strong><ul>' +
    a.map((x) => '<li><a href="' + x.url + '">' + x.name + "</a></li>").join("") + "</ul></div>";
}

export async function sendCampaign(campaignId: string): Promise<void> {
  const camp = (await db.get("email_campaigns", campaignId)) as Record<string, any> | null;
  if (!camp) return;
  const gw = emailGateway();
  const schools = targetSchools((await db.list("schools")) as Record<string, any>[], camp);
  const contacts = schools.map((s) => ({ email: s.coordinator_email as string, attributes: { SCHOOL_NAME: s.name, CITY: s.city, STATE: s.state } }));
  const list = await gw.outreach.syncContacts("Campaign " + (camp.campaign_code || campaignId), contacts);
  const gwCamp = await gw.outreach.createCampaign({ name: camp.name, subject: mergeTags(camp.subject), html: mergeTags(camp.html_content) + attachmentsFooter(camp.attachments), listId: list.listId });
  await gw.outreach.sendCampaign(gwCamp.campaignId);
  for (const s of schools) {
    await db.insert("email_sends", { send_ref: "SND-" + crypto.randomUUID().slice(0, 8).toUpperCase(), campaign_id: campaignId, school_id: s.id, email: s.coordinator_email, status: "queued" });
  }
  await db.update("email_campaigns", campaignId, { sent_count: schools.length });
}
