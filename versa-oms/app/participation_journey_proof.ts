// J3: Build roster — the participation's student-upload lifecycle (participations) + roster rows (students)
// with unique candidate IDs. Asserts each; exits 1 on failure.
import { POST as createSchool } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { POST as createOlympiad } from "@/api/olympiads/route";
import { POST as createParticipation } from "@/api/participations/route";
import { transitionParticipations } from "@/services/participations.service";
import { POST as createStudent, GET as listStudents } from "@/api/students/route";
import { sample } from "@/fixtures";
const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
let fails = 0;
const check = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };

async function main() {
  console.log("=== J3: Build roster (participations + students) ===");
  // an onboarded school (J1+J2)
  const sc: any = await createSchool(req(sample("schools", { school_code: "SCH-J3", status: "lead" })));
  const schoolId = sc.data.id;
  await transitionSchools(schoolId, "submit_registration" as never); await transitionSchools(schoolId, "approve_school" as never);
  // an olympiad to enter
  const ol: any = await createOlympiad(req({ olympiad_code: "OLY-MATH-26", name: "Math Olympiad 2026", academic_year: "2025-26", subject: "Mathematics", eligible_grades: "6-10", registration_open_at: "2026-01-01", registration_close_at: "2026-03-01", exam_window_start: "2026-04-01", exam_window_end: "2026-04-15", fee_per_student: "200", school_commission_per_student: "20", max_marks: "100" }));
  check(ol.status === 201, "olympiad created");
  // the participation: school enters olympiad, roster phase starts at students_open
  const pa: any = await createParticipation(req({ participation_code: "PART-J3-001", school_id: schoolId, olympiad_id: ol.data.id, status: "students_open" }));
  check(pa.status === 201, "participation created (school enters olympiad) @ students_open");
  const partId = pa.data.id;
  // upload roster rows (students) — each with a UNIQUE candidate_id (the OMR-sheet key)
  for (let i = 1; i <= 3; i++) {
    const st: any = await createStudent(req({ candidate_id: `CAND-J3-${i}`, school_id: schoolId, participation_id: partId, student_name: `Student ${i}`, grade: "7", school_roll_number: `R-${i}`, consent_obtained: true }));
    check(st.status === 201, `roster row ${i} (candidate CAND-J3-${i}) created`);
  }
  // guard: cannot finalise before validate
  let g = false; try { await transitionParticipations(partId, "finalise" as never); } catch { g = true; }
  check(g, "guard: finalise before validate -> rejected (lifecycle)");
  // roster lifecycle: upload_students -> validate -> finalise (lock)
  const r1: any = await transitionParticipations(partId, "upload_students" as never); check(r1.status === "upload_received", "upload_students -> upload_received");
  const r2: any = await transitionParticipations(partId, "validate" as never); check(r2.status === "validation_passed", "validate -> validation_passed");
  const r3: any = await transitionParticipations(partId, "finalise" as never); check(r3.status === "count_finalised", "finalise -> count_finalised (roster locked)");
  // the roster = students linked to THIS participation, each with a unique candidate_id
  const roster = ((await listStudents() as any).data).filter((s: any) => s.participation_id === partId);
  check(roster.length === 3, "roster = 3 students linked to the participation (real FK)");
  check(new Set(roster.map((s: any) => s.candidate_id)).size === 3, "every roster row has a UNIQUE candidate_id (OMR-sheet key)");
  if (fails) { console.error(`J3 FAILED: ${fails}`); process.exit(1); }
  console.log("J3 PASS");
}
main();
