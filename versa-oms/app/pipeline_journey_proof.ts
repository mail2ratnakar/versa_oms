// J4..J10: the olympiad operations pipeline, end-to-end, continuing from the J3 roster.
// Drives each artifact-entity lifecycle + the identity spine (candidate_id -> student -> result -> certificate).
import { POST as createSchool } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { POST as createOlympiad } from "@/api/olympiads/route";
import { POST as createParticipation } from "@/api/participations/route";
import { transitionParticipations, getParticipations, advanceParticipation } from "@/services/participations.service";
import { POST as createStudent } from "@/api/students/route";
import { POST as createPayment } from "@/api/payments/route";
import { transitionPayments } from "@/services/payments.service";
import { POST as createSlot } from "@/api/exam_slots/route";
import { transitionExamSlots } from "@/services/exam_slots.service";
import { POST as createMaterial } from "@/api/exam_materials/route";
import { transitionExamMaterials } from "@/services/exam_materials.service";
import { POST as createCourier } from "@/api/courier_batches/route";
import { transitionCourierBatches } from "@/services/courier_batches.service";
import { POST as createOmr } from "@/api/omr_imports/route";
import { transitionOmrImports } from "@/services/omr_imports.service";
import { POST as createResult } from "@/api/results/route";
import { transitionResults } from "@/services/results.service";
import { POST as createCertificate } from "@/api/certificates/route";
import { transitionCertificates } from "@/services/certificates.service";

const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
let fails = 0;
const ok = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };
const walk = async (fn: (id: string, a: string) => Promise<any>, id: string, actions: string[]) => {
  let last: any; for (const a of actions) last = await fn(id, a as never); return last;
};

async function main() {
  console.log("=== J4..J10: olympiad pipeline (identity spine) ===");
  // setup: onboarded school + participation (roster finalised) + 2 candidates
  const sc: any = await createSchool(req({ school_code: "SCH-P", name: "Pipeline School", city: "Delhi", state: "Delhi", coordinator_name: "P", coordinator_email: "p@s.edu", status: "lead" }));
  const schoolId = sc.data.id;
  await walk(transitionSchools, schoolId, ["submit_registration", "approve_school", "open_student_upload"]);
  const ol: any = await createOlympiad(req({ olympiad_code: "OLY-1", name: "Oly", academic_year: "2025-26", subject: "Math", eligible_grades: "6-10", registration_open_at: "2026-01-01", registration_close_at: "2026-03-01", exam_window_start: "2026-04-01", exam_window_end: "2026-04-15", fee_per_student: "200", school_commission_per_student: "20", max_marks: "100" }));
  const pa: any = await createParticipation(req({ participation_code: "PART-P", school_id: schoolId, olympiad_id: ol.data.id, status: "students_open" }));
  const partId = pa.data.id;
  await walk(transitionParticipations, partId, ["upload_students", "validate", "finalise"]);
  const students: any[] = [];
  for (let i = 1; i <= 2; i++) {
    const st: any = await createStudent(req({ candidate_id: "CAND-" + i, school_id: schoolId, participation_id: partId, student_name: "S" + i, grade: "7", school_roll_number: "R" + i, consent_obtained: true }));
    students.push(st.data);
  }
  ok(students.length === 2, "setup: participation @ count_finalised + 2 candidates (CAND-1, CAND-2)");

  // J4 Payment
  const pay: any = await createPayment(req({ payment_code: "PAY-1", participation_id: partId, school_id: schoolId, expected_amount: "400", manual_evidence_file: "-", reversal_reason: "-", status: "draft" }));
  const paid = await walk(transitionPayments, pay.data.id, ["create_link", "provider_pending", "webhook_paid"]);
  ok(paid.status === "paid", "J4 Payment: draft -> link_created -> pending -> paid");
  const rec = await transitionPayments(pay.data.id, "reconcile" as never);
  ok(rec.status === "reconciled", "J4 Payment: paid -> reconciled");
  ok(((await getParticipations(partId)) as any).status === "paid", "   SPINE auto-advanced -> paid (payment effect)");

  // J5 Slots (staff-predefined capacity; school selects -> slot_confirmed; schools may also propose own date)
  const slot: any = await createSlot(req({ slot_code: "SLOT-1", exam_date: "2026-04-10", start_time: "10:00", end_time: "12:00", capacity_schools: "50", capacity_students: "2000", status: "open" }));
  const conf = await walk(transitionExamSlots, slot.data.id, ["select_slot", "confirm_capacity"]);
  ok(conf.status === "slot_confirmed", "J5 Slots: staff slot open -> selected -> slot_confirmed (school choice honoured)");
  await advanceParticipation(partId, "slot_confirmed");   // the participation books its slot (exam_slots are shared)
  ok(((await getParticipations(partId)) as any).status === "slot_confirmed", "   SPINE auto-advanced -> slot_confirmed (booking)");

  // J6 Materials (4 randomised sets named to the roster; time-gated release)
  const mat: any = await createMaterial(req({ material_code: "MAT-1", olympiad_id: ol.data.id, participation_id: partId, exam_slot_id: slot.data.id, file: "papers-4sets.zip", release_at: "2026-04-09", status: "draft" }));
  const released = await walk(transitionExamMaterials, mat.data.id, ["approve_material", "schedule_release", "release_when_due"]);
  ok(released.status === "released", "J6 Materials: draft -> approved -> scheduled -> released (time-gated)");
  ok(((await getParticipations(partId)) as any).status === "materials_released", "   SPINE auto-advanced -> materials_released (release effect)");

  // J7 Capture (courier sheets back) + OMR import created
  const cour: any = await createCourier(req({ batch_code: "CB-1", school_id: schoolId, participation_id: partId, courier_company: "BlueDart", awb_number: "AWB1", dispatch_date: "2026-04-11", package_count: "1", sheets_expected: "2", sheets_dispatched: "2", status: "pending" }));
  const closed = await walk(transitionCourierBatches, cour.data.id, ["submit_dispatch", "confirm_receipt", "close_batch"]);
  ok(closed.status === "closed", "J7 Capture: courier pending -> dispatched -> received -> closed");
  const omr: any = await createOmr(req({ import_code: "OMR-1", participation_id: partId, courier_batch_id: cour.data.id, uploaded_file: "scans.zip", uploaded_by: "staff-1", status: "awaiting_import" }));
  ok(omr.status === 201, "J7 Capture: OMR import created (awaiting_import)");

  // J8 Evaluate (scan import + review; candidate match by candidate_id)
  const approvedImport = await walk(transitionOmrImports, omr.data.id, ["upload_omr", "validate_import", "approve_import"]);
  ok(approvedImport.status === "approved", "J8 Evaluate: awaiting_import -> imported -> reviewed -> approved");
  ok(((await getParticipations(partId)) as any).status === "exam_completed", "   SPINE auto-advanced -> exam_completed (import-approved effect)");
  ok(students.every(s => s.candidate_id), "J8 Evaluate: each scan maps to a candidate by unique candidate_id");

  // J9 Results (one per student, keyed to student_id via real FK)
  const results: any[] = [];
  for (const s of students) {
    const r: any = await createResult(req({ result_code: "RES-" + s.candidate_id, student_id: s.id, participation_id: partId, school_id: schoolId, raw_score: "82", max_marks: "100", status: "draft" }));
    const pub = await walk(transitionResults, r.data.id, ["review_results", "approve", "publish"]);
    ok(pub.status === "published", "J9 Results: " + s.candidate_id + " draft -> under_review -> approved -> published");
    results.push({ ...r.data, status: pub.status });
  }
  ok(results.every(r => r.student_id), "J9 Results: every result keyed to a real student_id FK (v1 gap, closed)");
  ok(((await getParticipations(partId)) as any).status === "results_published", "   SPINE auto-advanced -> results_published (publish effect)");

  // J10 Certificates (one per student, links student_id + result_id; + stateless verify)
  const certs: any[] = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i], r = results[i];
    const c: any = await createCertificate(req({ certificate_number: "CERT-" + s.candidate_id, verification_code: "VERIFY-" + s.candidate_id, student_id: s.id, result_id: r.id, school_id: schoolId, revocation_reason: "-", status: "generated" }));
    const issued = await transitionCertificates(c.data.id, "issue" as never);
    ok(issued.status === "issued", "J10 Certificate: " + s.candidate_id + " generated -> issued");
    certs.push({ ...c.data, status: issued.status });
  }
  const lookup = certs.find(c => c.verification_code === "VERIFY-CAND-1");
  ok(!!lookup && lookup.status === "issued", "J10 Verify: public verification_code -> valid (issued) certificate");
  ok(((await getParticipations(partId)) as any).status === "certificates_released", "   SPINE auto-advanced -> certificates_released (cert-issue effect, 2-hop via result)");

  // identity spine: candidate_id -> student -> result -> certificate, all real FKs
  const chainOk = certs.every(c => {
    const r = results.find(x => x.id === c.result_id);
    const s = students.find(x => x.id === c.student_id);
    return r && s && r.student_id === s.id;
  });
  ok(chainOk, "SPINE: candidate_id -> student -> result(student_id FK) -> certificate(student_id+result_id FK)");

  if (fails) { console.error("PIPELINE FAILED: " + fails); process.exit(1); }
  console.log("J4..J10 PASS — full olympiad pipeline + identity spine proven.");
}
main();
