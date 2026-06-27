// Outreach module, fully wired: import maps rows -> prospects · campaign start_send AUTO-fires the gateway
// (service hook) + creates email_sends · webhook -> tracking · prospect registers -> existing pipeline.
import { emailGateway } from "@/runtime/email/gateway";
import { processImport } from "@/runtime/import/school_importer";
import { POST as createImport } from "@/api/school_imports/route";
import { transitionSchoolImports } from "@/services/school_imports.service";
import { transitionSchools, listSchools } from "@/services/schools.service";
import { POST as createCampaign } from "@/api/email_campaigns/route";
import { transitionEmailCampaigns } from "@/services/email_campaigns.service";
import { transitionEmailSends, listEmailSends } from "@/services/email_sends.service";
import { sample } from "@/fixtures";

const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
const walk = async (fn: any, id: string, actions: string[]) => { let r: any; for (const a of actions) r = await fn(id, a); return r; };
let fails = 0;
const ok = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };

async function main() {
  console.log("=== Outreach (fully wired): import -> campaign(auto-send) -> track -> register ===");

  // 1. import batch -> processImport maps KVS rows -> prospect schools (email required, no-email skipped)
  const imp: any = await createImport(req(sample("school_imports", { source: "kvs", status: "uploaded" })));
  const rows = [
    { "School Code": "K-1", "Email Address": "kv1@example.test", "State": "Delhi", "Pin Code": "110001", "Office Address": "1 Rd" },
    { "School Code": "K-2", "Email Address": "kv2@example.test", "State": "Delhi", "Pin Code": "110002", "Office Address": "2 Rd" },
    { "School Code": "K-3", "State": "Delhi" },
  ];
  const r = await processImport(imp.data.id, rows);
  ok(r.imported === 2 && r.failed === 1, "import maps rows -> 2 prospects, 1 skipped (no email)");
  await walk(transitionSchoolImports, imp.data.id, ["validate_rows", "complete_import"]);
  const prospects = ((await listSchools()) as any[]).filter((s) => s.import_id === imp.data.id);
  ok(prospects.length === 2 && prospects[0].status === "prospect", "2 prospect schools linked to the batch");

  // 2. campaign — start_send AUTO-fires the gateway hook (sync+create+send) + creates email_sends
  const camp: any = await createCampaign(req(sample("email_campaigns", { channel: "outreach", status: "draft" })));
  await walk(transitionEmailCampaigns, camp.data.id, ["schedule", "start_send", "finish_send"]);
  const sends = ((await listEmailSends()) as any[]).filter((s) => s.campaign_id === camp.data.id);
  ok(sends.length === 2, "start_send hook -> gateway sent + 2 email_sends created (auto-wired, no manual call)");

  // 3. webhook -> tracking
  const events = emailGateway().outreach.normalizeWebhook({ event: "delivered", email: prospects[0].coordinator_email, "message-id": "abc" });
  const delivered = await walk(transitionEmailSends, sends[0].id, ["mark_sent", events[0].action]);
  ok(delivered.status === "delivered", "webhook 'delivered' -> normalize -> email_sends mark_delivered");

  // 4. a prospect registers -> existing pipeline
  const lead = await transitionSchools(prospects[0].id, "register_interest" as never);
  ok(lead.status === "lead", "prospect register_interest -> lead -> existing pipeline");

  if (fails) { console.error("OUTREACH FAILED: " + fails); process.exit(1); }
  console.log("OUTREACH PASS — import + auto-send + tracking + register, end-to-end.");
}
main();
