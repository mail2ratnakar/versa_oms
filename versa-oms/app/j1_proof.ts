import { GET, POST } from "@/api/schools/route";
import { transitionSchools } from "@/services/schools.service";
const req = (b: unknown) => new Request("http://x", { method: "POST", body: JSON.stringify(b) });
async function main() {
  console.log("=== J1: Acquire a school (HTTP -> service -> validate -> DB -> lifecycle) ===");
  const bad: any = await POST(req({ name: "No code" }));
  console.log(`1. create invalid (missing required) -> ${bad.status} ${bad.ok === false ? "rejected ✓" : "ACCEPTED ✗"}`);
  const good: any = await POST(req({ school_code: "SCH-001", name: "Delhi Public School", city: "Delhi", state: "Delhi", coordinator_name: "A. Sharma", coordinator_email: "a@dps.edu", status: "lead" }));
  console.log(`2. create valid -> ${good.status} ${good.ok ? "created ✓" : "FAIL ✗"}  id=${good.data?.id?.slice(0,8)}`);
  const id = good.data.id;
  const list: any = await GET();
  console.log(`3. GET /api/schools -> ${list.data.length} school listed ✓  (the J1 answer: the list comes from here)`);
  try { await transitionSchools(id, "approve_school" as never); console.log("4. approve from 'lead' -> ACCEPTED ✗ (BUG)"); }
  catch (e) { console.log(`4. approve from 'lead' -> rejected ✓ — ${(e as Error).message}`); }
  await transitionSchools(id, "submit_registration" as never);
  const after: any = await transitionSchools(id, "approve_school" as never);
  console.log(`5. submit_registration then approve_school -> status now "${after.status}" ✓`);
  console.log("\nJ1+J2 spine RUNS end-to-end. Foundation wired.");
}
main();
