import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-006 Courier Dispatch to Receipt (FR-COURIER-CHAIN-2026-0022). A shipment is dispatched and tracked
// through its lifecycle to received; a courier exception (incident) can be raised + resolved. Codes are
// server-generated (never client input). Fixture: seed_chain3.sql (E2E-CH3-SCH).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const STAFF = (key: string) => ({ "content-type": "application/json", "x-idempotency-key": key });

test("courier: shipment dispatched -> in_transit -> delivered -> received; exception raised + resolved", async ({ request }) => {
  const sb = admin();
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  test.skip(!sch, "run _validation/seed_chain3.sql");
  const u = Date.now();

  // Dispatch a shipment — code is SERVER-generated (client never supplies it).
  const create = await (await request.post("/api/staff/courier/shipments", { headers: STAFF(`cs-${u}`), data: { school_id: sch, awb_number: `AWB-${u}`, expected_count: 50 } })).json();
  expect(create.ok, "shipment created").toBe(true);
  expect(String(create.data.code), "server-generated code").toMatch(/^CS-/);
  const sid = String(create.data.id);

  // Track it through the dispatch -> receipt lifecycle.
  for (const [action, expected] of [["mark_in_transit", "in_transit"], ["deliver", "delivered"], ["receive", "received"]] as const) {
    const r = await (await request.post(`/api/staff/courier/shipments/${sid}/actions/${action}`, { headers: STAFF(`${action}-${u}`), data: {} })).json();
    expect(r.ok, action).toBe(true);
    expect(r.data.shipment_status, action).toBe(expected);
  }

  // Raise a courier exception (incident) and resolve it.
  const ex = await (await request.post("/api/staff/courier/exceptions", { headers: STAFF(`ce-${u}`), data: { school_id: sch, awb_number: `AWB-${u}`, reason: "count mismatch on receipt" } })).json();
  expect(ex.ok, "exception raised").toBe(true);
  const eid = String(ex.data.id);
  await request.post(`/api/staff/courier/exceptions/${eid}/actions/start_review`, { headers: STAFF(`sr-${u}`), data: {} });
  const res = await (await request.post(`/api/staff/courier/exceptions/${eid}/actions/resolve`, { headers: STAFF(`rs-${u}`), data: {} })).json();
  expect(res.ok, "exception resolved").toBe(true);
  expect(res.data.exception_status).toBe("resolved");
});
