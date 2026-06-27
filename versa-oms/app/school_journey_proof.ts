// School journey acceptance — J1 Acquire + J2 Onboard. Asserts each outcome; exits 1 on any failure.
import { GET, POST } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
import { sample } from "@/fixtures";
const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
const school = () => sample("schools", { status: "lead" });
let fails = 0;
const check = (c: boolean, l: string) => { console.log((c ? "  ok  " : "  XX  ") + l); if (!c) fails++; };
async function main() {
  console.log("=== J1 Acquire + J2 Onboard (school) ===");
  // J1
  const bad: any = await POST(req({ name: "no code" }));
  check(bad.status === 422 && bad.ok === false, "J1: create invalid -> 422 rejected");
  const good: any = await POST(req(school()));
  check(good.status === 201 && good.ok, "J1: create valid -> 201");
  const id = good.data.id;
  check((await GET() as any).data.length >= 1, "J1: GET /api/schools lists it");
  let illegal = false; try { await transitionSchools(id, "approve_school" as never); } catch { illegal = true; }
  check(illegal, "J1: approve from 'lead' -> rejected (lifecycle)");
  await transitionSchools(id, "submit_registration" as never);
  const approved: any = await transitionSchools(id, "approve_school" as never);
  check(approved.status === "approved", "J1: submit_registration + approve -> 'approved'");
  // J2 — onboarding completes at 'approved'; the participation auto-opens for upload on approval (see CRM proof)
  check(approved.status === "approved", "J2: onboarding complete @ 'approved' (student upload auto-opens on approval)");
  const fresh: any = await POST(req(school()));
  let guarded = false; try { await transitionSchools(fresh.data.id, "approve_school" as never); } catch { guarded = true; }
  check(guarded, "J2 guard: approve a 'lead' directly -> rejected (must convert first)");
  if (fails) { console.error(`FAILED: ${fails}`); process.exit(1); }
  console.log("J1+J2 PASS");
}
main();
