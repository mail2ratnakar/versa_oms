// Local dev harness (FROZEN-KERNEL) — serves generated screens + wires the generated API routes to the
// in-memory db so the violet UI is browsable. Not production (no auth, in-memory). Run: npx tsx app/dev_server.ts
import { createServer } from "http";
import { readFile } from "fs/promises";
import { join } from "path";
import { createSchools, transitionSchools } from "@/services/schools.service";
import { createOlympiads } from "@/services/olympiads.service";
import { createParticipations, transitionParticipations, listParticipations } from "@/services/participations.service";
import { createStudents } from "@/services/students.service";
import { createPayments, transitionPayments } from "@/services/payments.service";
import { createExamSlots, transitionExamSlots } from "@/services/exam_slots.service";
import { createExamMaterials, transitionExamMaterials } from "@/services/exam_materials.service";
import { createCourierBatches, transitionCourierBatches } from "@/services/courier_batches.service";
import { createOmrImports, transitionOmrImports } from "@/services/omr_imports.service";
import { createResults, transitionResults } from "@/services/results.service";
import { createCertificates, transitionCertificates } from "@/services/certificates.service";
import { createSchoolImports } from "@/services/school_imports.service";
import { createEmailCampaigns } from "@/services/email_campaigns.service";
import { processImport } from "@/runtime/import/school_importer";

import { sample } from "@/fixtures";
import { handleEmailWebhook } from "@/runtime/email/webhook";
import { importTemplateCsv } from "@/runtime/import/school_importer";
import { importUpload, importValidate, importRun } from "@/runtime/import/import_api";
import { lookupPincode } from "@/runtime/pincode/lookup";
import { sendTest } from "@/runtime/email/campaign_test";
const SCREENS = "spec/derived/screens";
const readBody = (req: any): Promise<string> => new Promise(r => { let d = ""; req.on("data", (c: any) => (d += c)); req.on("end", () => r(d)); });
const walk = async (fn: any, id: string, actions: string[]) => { for (const a of actions) await fn(id, a); };
const id = (r: any) => r.data.id;

async function seed() {
  try {
    const demo = JSON.parse(await readFile("spec/demo_data.json", "utf8"));   // readable demo values from the source
    const ol: any = await createOlympiads(sample("olympiads", demo.olympiad));
    // school 1: registered (auto-creates a participation) -> approved (auto-opens it for upload)
    const s1: any = await createSchools(sample("schools", { ...demo.schools[0], status: "lead" }));
    await walk(transitionSchools, id(s1), ["submit_registration", "approve_school"]);
    const part: any = (await listParticipations() as any[]).find((p) => p.school_id === id(s1));
    const studs: any[] = [];
    for (const d of demo.students) studs.push((await createStudents(sample("students", { ...d, school_id: id(s1), participation_id: part.id }))).data);
    await walk(transitionParticipations, part.id, ["upload_students", "validate", "finalise"]);
    const pay: any = await createPayments(sample("payments", { participation_id: part.id, school_id: id(s1), status: "draft" }));
    await walk(transitionPayments, id(pay), ["create_link", "provider_pending", "webhook_paid", "reconcile"]);
    const slot: any = await createExamSlots(sample("exam_slots", { status: "open" }));
    await walk(transitionExamSlots, id(slot), ["select_slot", "confirm_capacity"]);
    const mat: any = await createExamMaterials(sample("exam_materials", { olympiad_id: id(ol), participation_id: part.id, exam_slot_id: id(slot), status: "draft" }));
    await walk(transitionExamMaterials, id(mat), ["approve_material", "schedule_release", "release_when_due"]);
    const cb: any = await createCourierBatches(sample("courier_batches", { school_id: id(s1), participation_id: part.id, status: "pending" }));
    await walk(transitionCourierBatches, id(cb), ["submit_dispatch", "confirm_receipt", "close_batch"]);
    const omr: any = await createOmrImports(sample("omr_imports", { participation_id: part.id, courier_batch_id: id(cb), uploaded_by: "staff-1", status: "awaiting_import" }));
    await walk(transitionOmrImports, id(omr), ["upload_omr", "validate_import", "approve_import"]);
    for (const st of studs) {
      const r: any = await createResults(sample("results", { student_id: st.id, participation_id: part.id, school_id: id(s1), status: "draft" }));
      await walk(transitionResults, r.data.id, ["review_results", "approve", "publish"]);
      const c: any = await createCertificates(sample("certificates", { student_id: st.id, result_id: r.data.id, school_id: id(s1), verification_code: "VERIFY-" + st.candidate_id, status: "generated" }));
      await transitionCertificates(c.data.id, "issue");
    }
    // outreach/CRM demo: an import batch -> prospects -> a draft campaign
    const oimp: any = await createSchoolImports(sample("school_imports", { source: "demo", status: "uploaded" }));
    await processImport(oimp.data.id, demo.prospects);
    await createEmailCampaigns(sample("email_campaigns", { ...demo.campaign, channel: "outreach", status: "draft" }));
    await createSchools(sample("schools", { ...demo.schools[1], status: "lead" }));   // a fresh lead
    console.log("seeded from spec/demo_data.json: " + demo.schools[0].name + " -> issued certificates, + 1 lead");
  } catch (e) { console.error("seed warning:", (e as Error).message); }
}
async function handle(req: any, res: any) {
  const path = new URL(req.url, "http://x").pathname;
  if (path === "/lucide.js") { try { const b = await readFile("spec/derived/lucide.js"); res.writeHead(200, { "content-type": "application/javascript" }); res.end(b); } catch { res.writeHead(404); res.end("vendor lucide"); } return; }
  if (path === "/campaignspec" || path === "/campaignspec.html") { try { const b = await readFile("spec/derived/campaignspec.html"); res.writeHead(200, { "content-type": "text/html" }); res.end(b); } catch { res.writeHead(404); res.end("run: python versa-oms/generators/robots/gen_campaignspec.py"); } return; }
  if (path === "/iconpicker" || path === "/iconpicker.html") { try { const b = await readFile("spec/derived/iconpicker.html"); res.writeHead(200, { "content-type": "text/html" }); res.end(b); } catch { res.writeHead(404); res.end("run: python versa-oms/generators/robots/gen_iconpicker.py"); } return; }
  const portalIdx = path === "/portal" || path === "/portal/";
  const staffIdx = path === "/staff" || path === "/staff/";
  if (path === "/" || portalIdx || staffIdx || /\.(html|css)$/.test(path)) {
    let dir = SCREENS, file = path === "/" ? "schools.html" : path.slice(1);
    if (portalIdx) { dir = "spec/derived/portal"; file = "index.html"; }
    else if (staffIdx) { dir = "spec/derived/staff"; file = "index.html"; }
    else if (path.startsWith("/portal/")) { dir = "spec/derived/portal"; file = path.slice(8) || "index.html"; }
    else if (path.startsWith("/staff/")) { dir = "spec/derived/staff"; file = path.slice(7) || "index.html"; }
    try { const b = await readFile(join(dir, file)); res.writeHead(200, { "content-type": file.endsWith(".css") ? "text/css" : "text/html" }); res.end(b); }
    catch { res.writeHead(404); res.end("not found"); }
    return;
  }
  if (path === "/api/import-template") {
    res.writeHead(200, { "content-type": "text/csv", "content-disposition": "attachment; filename=school_import_template.csv" }); res.end(importTemplateCsv()); return;
  }
  if (path === "/api/webhooks/email" && req.method === "POST") {
    const result = await handleEmailWebhook(JSON.parse((await readBody(req)) || "{}"));
    res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(result)); return;
  }
  if (path === "/api/import/upload" && req.method === "POST") {
    const r = importUpload(JSON.parse((await readBody(req)) || "{}")); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(r)); return;
  }
  if (path === "/api/import/validate" && req.method === "POST") {
    const r = await importValidate(JSON.parse((await readBody(req)) || "{}")); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(r)); return;
  }
  if (path === "/api/import/run" && req.method === "POST") {
    const r = await importRun(JSON.parse((await readBody(req)) || "{}")); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(r)); return;
  }
  if (path.startsWith("/api/pincode/") && req.method === "GET") { const r = await lookupPincode(path.slice(13)); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(r || {})); return; }
  if (path === "/api/campaign/test" && req.method === "POST") { const b = JSON.parse((await readBody(req)) || "{}"); const r = await sendTest(b.email, b.subject, b.html); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(r)); return; }
  const m = path.match(/^\/api\/([a-z_]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (m) {
    const [, entity, rid, action] = m;
    const body = ["POST", "PATCH"].includes(req.method) ? await readBody(req) : undefined;
    const request = new Request("http://x" + path, { method: req.method, body, headers: { "content-type": "application/json" } });
    let result: any;
    try {
      if (rid && action) { const mod: any = await import(`../spec/derived/routes/api/${entity}/[id]/[action]/route.ts`); result = await mod.POST(request, { params: { id: rid, action } }); }
      else if (rid) { const mod: any = await import(`../spec/derived/routes/api/${entity}/[id]/route.ts`); result = req.method === "PATCH" ? await mod.PATCH(request, { params: { id: rid } }) : req.method === "DELETE" ? await mod.DELETE(request, { params: { id: rid } }) : await mod.GET(request, { params: { id: rid } }); }
      else { const mod: any = await import(`../spec/derived/routes/api/${entity}/route.ts`); result = req.method === "POST" ? await mod.POST(request) : await mod.GET(); }
    } catch (e) { res.writeHead(404); res.end(JSON.stringify({ ok: false, error: String((e as Error).message) })); return; }
    res.writeHead(result.status || 200, { "content-type": "application/json" }); res.end(JSON.stringify(result)); return;
  }
  res.writeHead(404); res.end("not found");
}
async function start() {
  await seed();
  createServer((req, res) => handle(req, res).catch((e) => { res.writeHead(500); res.end(String(e)); })).listen(3400, () => console.log("dev server: http://localhost:3400/schools.html"));
}
start();
