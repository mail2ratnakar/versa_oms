// OJ2: Schools (acquire -> onboard). OJ2.1 create lead -> OJ2.2 convert (+ participation) -> OJ2.3 approve -> OJ2.4 open.
import { POST as createSchool } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { POST as createOlympiad } from "@/api/olympiads/route";
import { GET as listParticipations } from "@/api/participations/route";

import { sample } from "@/fixtures";
const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
let fails = 0;
const ok = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };
const partsFor = async (sid: string) => ((await listParticipations() as any).data).filter((p: any) => p.school_id === sid);

async function main() {
  console.log("=== OJ2: Schools (acquire -> onboard) ===");
  await createOlympiad(req(sample("olympiads")));

  // OJ2.1 — Sales creates a lead
  const lead: any = await createSchool(req(sample("schools", { status: "lead" })));
  ok(lead.status === 201 && lead.data.status === "lead", "OJ2.1 create lead -> school @ lead");
  const sid = lead.data.id;
  ok((await partsFor(sid)).length === 0, "no participation before convert");

  // OJ2.2 — convert (registration also creates a participation)
  const reg: any = await transitionSchools(sid, "submit_registration" as never);
  ok(reg.status === "registered", "OJ2.2 convert (submit_registration) -> registered");
  const after = await partsFor(sid);
  ok(after.length === 1 && after[0].status === "submitted", "OJ2.2 registration created a participation @ submitted (pending approval)");

  // OJ2.3 — approve (AUTO-OPENS the participation for upload; no manual OJ2.4 step)
  ok((await transitionSchools(sid, "approve_school" as never)).status === "approved", "OJ2.3 approve_school -> approved");
  ok((await partsFor(sid))[0].status === "students_open", "OJ2.3 approval AUTO-OPENED the participation @ students_open (no manual open)");

  // guard: a raw lead cannot be approved without converting first
  const lead2: any = await createSchool(req(sample("schools", { status: "lead" })));
  let blocked = false; try { await transitionSchools(lead2.data.id, "approve_school" as never); } catch { blocked = true; }
  ok(blocked, "guard: approve a 'lead' directly -> rejected (must convert first)");

  if (fails) { console.error("OJ2 CRM FAILED: " + fails); process.exit(1); }
  console.log("OJ2 CRM PASS");
}
main();
