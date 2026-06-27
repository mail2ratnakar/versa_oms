// Local dev harness (FROZEN-KERNEL) — serves generated screens + wires the generated API routes to the
// in-memory db so the violet UI is browsable. Not production (no auth, in-memory). Run: npx tsx app/dev_server.ts
import { createServer } from "http";
import { readFile } from "fs/promises";
import { join } from "path";
import { createSchools, transitionSchools } from "@/services/schools.service";
import { createOlympiads } from "@/services/olympiads.service";
import { createParticipations, transitionParticipations } from "@/services/participations.service";
import { createStudents } from "@/services/students.service";
import { createPayments, transitionPayments } from "@/services/payments.service";
import { createExamSlots, transitionExamSlots } from "@/services/exam_slots.service";
import { createExamMaterials, transitionExamMaterials } from "@/services/exam_materials.service";
import { createCourierBatches, transitionCourierBatches } from "@/services/courier_batches.service";
import { createOmrImports, transitionOmrImports } from "@/services/omr_imports.service";
import { createResults, transitionResults } from "@/services/results.service";
import { createCertificates, transitionCertificates } from "@/services/certificates.service";

const SCREENS = "spec/derived/screens";
const readBody = (req: any): Promise<string> => new Promise(r => { let d = ""; req.on("data", (c: any) => (d += c)); req.on("end", () => r(d)); });
const walk = async (fn: any, id: string, actions: string[]) => { for (const a of actions) await fn(id, a); };
const id = (r: any) => r.data.id;

async function seed() {
  try {
    // a school taken all the way through the pipeline, so every screen has data
    const s1: any = await createSchools({ school_code: "SCH-DPS", name: "Delhi Public School", city: "Delhi", state: "Delhi", coordinator_name: "A. Sharma", coordinator_email: "a@dps.edu", status: "lead" });
    await walk(transitionSchools, id(s1), ["submit_registration", "approve_school", "open_student_upload"]);
    await createSchools({ school_code: "SCH-STM", name: "St. Marys School", city: "Mumbai", state: "Maharashtra", coordinator_name: "B. Roy", coordinator_email: "b@stm.edu", status: "lead" });
    const ol: any = await createOlympiads({ olympiad_code: "OLY-MATH-26", name: "Math Olympiad 2026", academic_year: "2025-26", subject: "Mathematics", eligible_grades: "6-10", registration_open_at: "2026-01-01", registration_close_at: "2026-03-01", exam_window_start: "2026-04-01", exam_window_end: "2026-04-15", fee_per_student: "200", school_commission_per_student: "20", max_marks: "100" });
    const pa: any = await createParticipations({ participation_code: "PART-001", school_id: id(s1), olympiad_id: id(ol), status: "students_open" });
    await walk(transitionParticipations, id(pa), ["upload_students", "validate", "finalise"]);
    const studs: any[] = [];
    for (let i = 1; i <= 3; i++) studs.push((await createStudents({ candidate_id: "CAND-" + i, school_id: id(s1), participation_id: id(pa), student_name: "Student " + i, grade: "7", school_roll_number: "R" + i, consent_obtained: true })).data);
    const pay: any = await createPayments({ payment_code: "PAY-001", participation_id: id(pa), school_id: id(s1), expected_amount: "600", manual_evidence_file: "-", reversal_reason: "-", status: "draft" });
    await walk(transitionPayments, id(pay), ["create_link", "provider_pending", "webhook_paid", "reconcile"]);
    const slot: any = await createExamSlots({ slot_code: "SLOT-A", exam_date: "2026-04-10", start_time: "10:00", end_time: "12:00", capacity_schools: "50", capacity_students: "2000", status: "open" });
    await walk(transitionExamSlots, id(slot), ["select_slot", "confirm_capacity"]);
    const mat: any = await createExamMaterials({ material_code: "MAT-001", olympiad_id: id(ol), participation_id: id(pa), exam_slot_id: id(slot), file: "papers-4sets.zip", release_at: "2026-04-09", status: "draft" });
    await walk(transitionExamMaterials, id(mat), ["approve_material", "schedule_release", "release_when_due"]);
    const cb: any = await createCourierBatches({ batch_code: "CB-001", school_id: id(s1), participation_id: id(pa), courier_company: "BlueDart", awb_number: "AWB1", dispatch_date: "2026-04-11", package_count: "1", sheets_expected: "3", sheets_dispatched: "3", status: "pending" });
    await walk(transitionCourierBatches, id(cb), ["submit_dispatch", "confirm_receipt", "close_batch"]);
    const omr: any = await createOmrImports({ import_code: "OMR-001", participation_id: id(pa), courier_batch_id: id(cb), uploaded_file: "scans.zip", uploaded_by: "staff-1", status: "awaiting_import" });
    await walk(transitionOmrImports, id(omr), ["upload_omr", "validate_import", "approve_import"]);
    for (const st of studs) {
      const r: any = await createResults({ result_code: "RES-" + st.candidate_id, student_id: st.id, participation_id: id(pa), school_id: id(s1), raw_score: "82", max_marks: "100", status: "draft" });
      await walk(transitionResults, r.data.id, ["review_results", "approve", "publish"]);
      const c: any = await createCertificates({ certificate_number: "CERT-" + st.candidate_id, verification_code: "VERIFY-" + st.candidate_id, student_id: st.id, result_id: r.data.id, school_id: id(s1), revocation_reason: "-", status: "generated" });
      await transitionCertificates(c.data.id, "issue");
    }
    console.log("seeded: full J1-J10 pipeline (school -> ... -> issued certificates) + 1 lead school");
  } catch (e) { console.error("seed warning:", (e as Error).message); }
}
async function handle(req: any, res: any) {
  const path = new URL(req.url, "http://x").pathname;
  const portalIdx = path === "/portal" || path === "/portal/";
  if (path === "/" || portalIdx || /\.(html|css)$/.test(path)) {
    let dir = SCREENS, file = path === "/" ? "schools.html" : path.slice(1);
    if (portalIdx) { dir = "spec/derived/portal"; file = "index.html"; }
    else if (path.startsWith("/portal/")) { dir = "spec/derived/portal"; file = path.slice(8) || "index.html"; }
    try { const b = await readFile(join(dir, file)); res.writeHead(200, { "content-type": file.endsWith(".css") ? "text/css" : "text/html" }); res.end(b); }
    catch { res.writeHead(404); res.end("not found"); }
    return;
  }
  const m = path.match(/^\/api\/([a-z_]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (m) {
    const [, entity, rid, action] = m;
    const body = ["POST", "PATCH"].includes(req.method) ? await readBody(req) : undefined;
    const request = new Request("http://x" + path, { method: req.method, body, headers: { "content-type": "application/json" } });
    let result: any;
    try {
      if (rid && action) { const mod: any = await import(`../spec/derived/routes/api/${entity}/[id]/[action]/route.ts`); result = await mod.POST(request, { params: { id: rid, action } }); }
      else if (rid) { const mod: any = await import(`../spec/derived/routes/api/${entity}/[id]/route.ts`); result = req.method === "PATCH" ? await mod.PATCH(request, { params: { id: rid } }) : await mod.GET(request, { params: { id: rid } }); }
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
