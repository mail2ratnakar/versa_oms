// Outreach module: import directory -> prospect schools -> campaign -> EmailGateway send -> webhook ->
// email_sends tracking -> a prospect registers and joins the existing pipeline. Gateway = console provider.
import { emailGateway } from "@/runtime/email/gateway";
import { POST as createImport } from "@/api/school_imports/route";
import { transitionSchoolImports } from "@/services/school_imports.service";
import { POST as createSchool } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { POST as createCampaign } from "@/api/email_campaigns/route";
import { transitionEmailCampaigns } from "@/services/email_campaigns.service";
import { POST as createSend } from "@/api/email_sends/route";
import { transitionEmailSends } from "@/services/email_sends.service";
import { sample } from "@/fixtures";

const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
const walk = async (fn: any, id: string, actions: string[]) => { let r: any; for (const a of actions) r = await fn(id, a); return r; };
let fails = 0;
const ok = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };

async function main() {
  console.log("=== Outreach: import -> campaign -> gateway -> register ===");
  const gw = emailGateway();   // console provider (no creds) — swap via env to brevo

  // 1. import batch -> prospect schools
  const imp: any = await createImport(req(sample("school_imports", { source: "kvs", status: "uploaded" })));
  await transitionSchoolImports(imp.data.id, "validate_rows" as never);
  const prospects: any[] = [];
  for (let i = 1; i <= 2; i++) prospects.push((await createSchool(req(sample("schools", { import_id: imp.data.id, source: "import", status: "prospect", coordinator_email: `school${i}@example.test` })))).data);
  await transitionSchoolImports(imp.data.id, "complete_import" as never);
  ok(prospects.length === 2 && prospects[0].status === "prospect", "import -> 2 prospect schools (linked to batch)");

  // 2. campaign + gateway (sync contacts, create + send campaign)
  const camp: any = await createCampaign(req(sample("email_campaigns", { channel: "outreach", status: "draft" })));
  const synced = await gw.outreach.syncContacts("Campaign " + camp.data.campaign_code, prospects.map((p) => ({ email: p.coordinator_email })));
  ok(synced.imported === 2, "gateway.syncContacts -> 2 contacts (console adapter)");
  const gwCamp = await gw.outreach.createCampaign({ name: camp.data.name, subject: camp.data.subject, html: camp.data.html_content, listId: synced.listId });
  await gw.outreach.sendCampaign(gwCamp.campaignId);
  const sent = await walk(transitionEmailCampaigns, camp.data.id, ["schedule", "start_send", "finish_send"]);
  ok(sent.status === "sent", "campaign draft -> scheduled -> sending -> sent");

  // 3. email_sends per school + webhook -> tracking
  const sends: any[] = [];
  for (const p of prospects) sends.push((await createSend(req(sample("email_sends", { campaign_id: camp.data.id, school_id: p.id, email: p.coordinator_email, status: "queued" })))).data);
  const events = gw.outreach.normalizeWebhook({ event: "delivered", email: prospects[0].coordinator_email, "message-id": "abc" });
  const delivered = await walk(transitionEmailSends, sends[0].id, ["mark_sent", events[0].action]);
  ok(delivered.status === "delivered", "webhook 'delivered' -> normalize -> email_sends mark_delivered");

  // 4. a prospect registers -> joins the existing pipeline
  const lead = await transitionSchools(prospects[0].id, "register_interest" as never);
  ok(lead.status === "lead", "prospect registers (register_interest) -> lead -> existing flow");

  if (fails) { console.error("OUTREACH FAILED: " + fails); process.exit(1); }
  console.log("OUTREACH PASS — module + gateway proven end-to-end.");
}
main();
