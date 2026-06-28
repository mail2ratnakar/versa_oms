// FROZEN-KERNEL — Mode A: send a campaign from here. gen_services calls sendCampaign from email_campaigns.
// start_send. Targets the campaign's selected schools (target_ids from the directory) or, if none, all
// prospect/lead. Merge tags ({{school_name}} etc.) map to Brevo contact attributes for per-recipient personalization.
import { db } from "@/runtime/db";
import { emailGateway } from "./gateway";
import { readFileSync } from "fs";

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

let _cta: any = { path: "/register", label: "Register your school", intro: "" };
try { _cta = JSON.parse(readFileSync(new URL("../../../spec/derived/registration_cta.json", import.meta.url), "utf-8")); } catch (e) { /* default */ }
// the registration CTA appended to every campaign email; ?ref carries campaign_code + recipient (Brevo merge tag) -> schools.referral
export function registrationFooter(campaignCode: string): string {
  const base = process.env.PUBLIC_BASE_URL || "http://localhost:3400";
  const url = base + (_cta.path || "/register") + "?ref=" + ((campaignCode || "CMP") + ".{{contact.EMAIL}}");
  return '<div style="margin-top:26px;padding-top:18px;border-top:1px solid #eee;font-family:system-ui;text-align:center">'
    + (_cta.intro ? '<p style="font-size:14px;color:#444;margin:0 0 12px">' + _cta.intro + '</p>' : '')
    + '<a href="' + url + '" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">' + (_cta.label || "Register your school") + ' →</a></div>';
}
export async function sendCampaign(campaignId: string): Promise<void> {
  const camp = (await db.get("email_campaigns", campaignId)) as Record<string, any> | null;
  if (!camp) return;
  const gw = emailGateway();
  const allSchools = (await db.list("schools")) as Record<string, any>[];
  const emails = String(camp.recipient_emails || "").split("\n").map((e) => e.trim()).filter(Boolean);
  // explicit Email IDs from the builder win; else fall back to the campaign's targeted schools
  const recipients = emails.length
    ? emails.map((e) => { const s = allSchools.find((x) => x.coordinator_email === e); return s ? { email: e, name: s.name as string, city: s.city, state: s.state, sid: (s.id as string | null) } : { email: e, name: e, city: "", state: "", sid: null }; })
    : targetSchools(allSchools, camp).map((s) => ({ email: s.coordinator_email as string, name: s.name as string, city: s.city, state: s.state, sid: (s.id as string | null) }));
  const contacts = recipients.map((r) => ({ email: r.email, attributes: { SCHOOL_NAME: r.name, CITY: r.city, STATE: r.state } }));
  const list = await gw.outreach.syncContacts("Campaign " + (camp.campaign_code || campaignId), contacts);
  const gwCamp = await gw.outreach.createCampaign({ name: camp.name, subject: mergeTags(camp.subject), html: mergeTags(camp.html_content) + attachmentsFooter(camp.attachments) + registrationFooter(camp.campaign_code), listId: list.listId });
  await gw.outreach.sendCampaign(gwCamp.campaignId);
  for (const r of recipients) {
    await db.insert("email_sends", { send_ref: "SND-" + crypto.randomUUID().slice(0, 8).toUpperCase(), campaign_id: campaignId, school_id: r.sid, email: r.email, status: "queued" });
  }
  await db.update("email_campaigns", campaignId, { sent_count: recipients.length });
}
