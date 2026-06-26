// Local dev harness (FROZEN-KERNEL) — serves generated screens + wires the generated API routes to the
// in-memory db so the violet UI is browsable. Not production (no auth, in-memory). Run: npx tsx app/dev_server.ts
import { createServer } from "http";
import { readFile } from "fs/promises";
import { join } from "path";
import { createSchools, transitionSchools } from "@/services/schools.service";
const SCREENS = "spec/derived/screens";
const readBody = (req: any): Promise<string> => new Promise(r => { let d = ""; req.on("data", (c: any) => (d += c)); req.on("end", () => r(d)); });

async function seed() {
  const a: any = await createSchools({ school_code: "SCH-DPS", name: "Delhi Public School", city: "Delhi", state: "Delhi", coordinator_name: "A. Sharma", coordinator_email: "a@dps.edu", status: "lead" });
  await transitionSchools(a.data.id, "submit_registration" as never);
  await transitionSchools(a.data.id, "approve_school" as never);
  await transitionSchools(a.data.id, "open_student_upload" as never);   // -> students_open (onboarded/active)
  await createSchools({ school_code: "SCH-STM", name: "St. Marys School", city: "Mumbai", state: "Maharashtra", coordinator_name: "B. Roy", coordinator_email: "b@stm.edu", status: "lead" });
  console.log("seeded: 1 active school (students_open) + 1 new lead");
}
async function handle(req: any, res: any) {
  const path = new URL(req.url, "http://x").pathname;
  if (path === "/" || /\.(html|css)$/.test(path)) {
    const file = path === "/" ? "schools.html" : path.slice(1);
    try { const b = await readFile(join(SCREENS, file)); res.writeHead(200, { "content-type": file.endsWith(".css") ? "text/css" : "text/html" }); res.end(b); }
    catch { res.writeHead(404); res.end("not found"); }
    return;
  }
  const m = path.match(/^\/api\/([a-z_]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (m) {
    const [, entity, id, action] = m;
    const body = ["POST", "PATCH"].includes(req.method) ? await readBody(req) : undefined;
    const request = new Request("http://x" + path, { method: req.method, body, headers: { "content-type": "application/json" } });
    let result: any;
    try {
      if (id && action) { const mod: any = await import(`../spec/derived/routes/api/${entity}/[id]/[action]/route.ts`); result = await mod.POST(request, { params: { id, action } }); }
      else if (id) { const mod: any = await import(`../spec/derived/routes/api/${entity}/[id]/route.ts`); result = req.method === "PATCH" ? await mod.PATCH(request, { params: { id } }) : await mod.GET(request, { params: { id } }); }
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
