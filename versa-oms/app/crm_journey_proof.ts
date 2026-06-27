// OJ2: Schools (acquire -> onboard). OJ2.1 create lead -> OJ2.2 convert (+ participation) -> OJ2.3 approve -> OJ2.4 open.
import { POST as createSchool } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { POST as createOlympiad } from "@/api/olympiads/route";
import { GET as listParticipations } from "@/api/participations/route";

const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
let fails = 0;
const ok = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };
const partsFor = async (sid: string) => ((await listParticipations() as any).data).filter((p: any) => p.school_id === sid);

async function main() {
  console.log("=== OJ2: Schools (acquire -> onboard) ===");
  await createOlympiad(req({ olympiad_code: "OLY-CRM", name: "Oly", academic_year: "2025-26", subject: "Math", eligible_grades: "6-10", registration_open_at: "2026-01-01", registration_close_at: "2026-03-01", exam_window_start: "2026-04-01", exam_window_end: "2026-04-15", fee_per_student: "200", school_commission_per_student: "20", max_marks: "100" }));

  // OJ2.1 — Sales creates a lead
  const lead: any = await createSchool(req({ school_code: "SCH-LEAD", name: "Prospect School", city: "Pune", state: "Maharashtra", coordinator_name: "L. Sales", coordinator_email: "l@prospect.edu", status: "lead" }));
  ok(lead.status === 201 && lead.data.status === "lead", "OJ2.1 create lead -> school @ lead");
  const sid = lead.data.id;
  ok((await partsFor(sid)).length === 0, "no participation before convert");

  // OJ2.2 — convert (registration also creates a participation)
  const reg: any = await transitionSchools(sid, "submit_registration" as never);
  ok(reg.status === "registered", "OJ2.2 convert (submit_registration) -> registered");
  const after = await partsFor(sid);
  ok(after.length === 1 && after[0].status === "students_open", "OJ2.2 registration created a participation @ students_open");

  // OJ2.3 — approve
  ok((await transitionSchools(sid, "approve_school" as never)).status === "approved", "OJ2.3 approve_school -> approved");
  // OJ2.4 — open student upload
  ok((await transitionSchools(sid, "open_student_upload" as never)).status === "students_open", "OJ2.4 open_student_upload -> students_open");

  // guard: a raw lead cannot be approved without converting first
  const lead2: any = await createSchool(req({ school_code: "SCH-L2", name: "P2", city: "X", state: "Y", coordinator_name: "M", coordinator_email: "m@p.edu", status: "lead" }));
  let blocked = false; try { await transitionSchools(lead2.data.id, "approve_school" as never); } catch { blocked = true; }
  ok(blocked, "guard: approve a 'lead' directly -> rejected (must convert first)");

  if (fails) { console.error("OJ2 CRM FAILED: " + fails); process.exit(1); }
  console.log("OJ2 CRM PASS");
}
main();
