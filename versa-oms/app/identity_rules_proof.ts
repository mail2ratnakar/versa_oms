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
  const sc: any = await createSchool(req(sample("schools", { status: "lead" })));
  const schoolId = sc.data.id;
  await transitionSchools(schoolId, "submit_registration" as never); await transitionSchools(schoolId, "approve_school" as never);
  const ol: any = await createOlympiad(req(sample("olympiads")));
  const pa: any = await createParticipation(req(sample("participations", { school_id: schoolId, olympiad_id: ol.data.id, status: "students_open" })));
  const partId = pa.data.id;

  // 1. candidate_id auto-generated when not provided (BRD §18)
  const s1: any = await createStudents(sample("students", { school_id: schoolId, participation_id: partId }) as any);
  const cid1 = s1.data?.candidate_id;
  ok(s1.ok && /^CAND-[A-Z0-9]{8}$/.test(cid1 || ""), "candidate_id auto-generated: " + cid1);

  // 2. an explicitly-provided candidate_id is preserved (stable)
  const s2: any = await createStudents(sample("students", { candidate_id: "CAND-EXPLICIT", school_id: schoolId, participation_id: partId }) as any);
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
