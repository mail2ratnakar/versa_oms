// J1 acceptance — asserts the 5 outcomes; exits 1 on any failure so check_journey can rely on it.
import { GET, POST } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
let fails = 0;
const check = (cond: boolean, label: string) => { console.log((cond ? "  ok  " : "  XX  ") + label); if (!cond) fails++; };
async function main() {
  console.log("=== J1: Acquire a school ===");
  const bad: any = await POST(req({ name: "No code" }));
  check(bad.status === 422 && bad.ok === false, "create invalid -> 422 rejected");
  const good: any = await POST(req({ school_code: "SCH-001", name: "Delhi Public School", city: "Delhi", state: "Delhi", coordinator_name: "A. Sharma", coordinator_email: "a@dps.edu", status: "lead" }));
  check(good.status === 201 && good.ok === true, "create valid -> 201");
  const id = good.data?.id;
  const list: any = await GET();
  check(list.data.length === 1, "GET list -> 1 school");
  let blocked = false;
  try { await transitionSchools(id, "approve_school" as never); } catch { blocked = true; }
  check(blocked, "approve from lead -> rejected");
  await transitionSchools(id, "submit_registration" as never);
  const after: any = await transitionSchools(id, "approve_school" as never);
  check(after.status === "approved", "submit then approve -> approved");
  if (fails) { console.error(`J1 FAILED: ${fails}`); process.exit(1); }
  console.log("J1 PASS");
}
main();
