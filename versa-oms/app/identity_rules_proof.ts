// Identity rules: candidate_id auto-generation (BRD §18, unique + stable) + omr_candidate_match (BRD §10).
import { POST as createSchool } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { POST as createOlympiad } from "@/api/olympiads/route";
import { POST as createParticipation } from "@/api/participations/route";
import { createStudents } from "@/services/students.service";
import { matchOmrCandidates } from "@/services/omr_imports.service";

import { sample } from "@/fixtures";
const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
let fails = 0;
const ok = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };

async function main() {
  console.log("=== Identity rules: candidate_id auto-gen + omr_candidate_match ===");
  const sc: any = await createSchool(req(sample("schools", { school_code: "SCH-ID", status: "lead" })));
  const schoolId = sc.data.id;
  await transitionSchools(schoolId, "submit_registration" as never); await transitionSchools(schoolId, "approve_school" as never);
  const ol: any = await createOlympiad(req({ olympiad_code: "OLY-ID", name: "Oly", academic_year: "2025-26", subject: "Math", eligible_grades: "6-10", registration_open_at: "2026-01-01", registration_close_at: "2026-03-01", exam_window_start: "2026-04-01", exam_window_end: "2026-04-15", fee_per_student: "200", school_commission_per_student: "20", max_marks: "100" }));
  const pa: any = await createParticipation(req({ participation_code: "PART-ID", school_id: schoolId, olympiad_id: ol.data.id, status: "students_open" }));
  const partId = pa.data.id;

  // 1. candidate_id auto-generated when not provided (BRD §18)
  const s1: any = await createStudents({ school_id: schoolId, participation_id: partId, student_name: "A", grade: "7", consent_obtained: true } as any);
  const cid1 = s1.data?.candidate_id;
  ok(s1.ok && /^CAND-[A-Z0-9]{8}$/.test(cid1 || ""), "candidate_id auto-generated: " + cid1);

  // 2. an explicitly-provided candidate_id is preserved (stable)
  const s2: any = await createStudents({ candidate_id: "CAND-EXPLICIT", school_id: schoolId, participation_id: partId, student_name: "B", grade: "7", consent_obtained: true } as any);
  ok(s2.data?.candidate_id === "CAND-EXPLICIT", "explicit candidate_id preserved (stable)");

  // 3. omr_candidate_match: valid x2, one unknown, one duplicate
  const scan = [cid1, "CAND-EXPLICIT", "CAND-GHOST", cid1];
  const m = await matchOmrCandidates(partId, scan);
  ok(m.matched.length === 2, "matched the 2 real roster candidates");
  ok(m.errors.some((e) => e.candidate_id === "CAND-GHOST" && e.reason.includes("roster")), "unknown candidate rejected (not in participation roster)");
  ok(m.errors.some((e) => e.candidate_id === cid1 && e.reason.includes("duplicate")), "duplicate scan rejected");

  if (fails) { console.error("IDENTITY RULES FAILED: " + fails); process.exit(1); }
  console.log("IDENTITY RULES PASS");
}
main();
