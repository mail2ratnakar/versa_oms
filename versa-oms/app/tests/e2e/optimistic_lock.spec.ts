import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-OPTIMISTIC-LOCK-2026-0038 / negative pack GLOBAL-CONC-001 — concurrent edit. An If-Match token
// (expected_updated_at) blocks silently overwriting a record that changed since it was read. Edits a
// seeded portal_role (legacy_admin).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
const H = (k: string) => ({ "content-type": "application/json", "x-idempotency-key": k });

test("a stale optimistic-lock token is rejected with 409 (GLOBAL-CONC-001)", async ({ request }) => {
  const sb = admin();
  const role = (await sb.from("portal_roles").select("id, updated_at").eq("role_id", "legacy_admin").maybeSingle()).data as { id?: string; updated_at?: string } | null;
  test.skip(!role?.id || !role.updated_at, "run seed_chain3.sql (legacy_admin role)");
  const u = Date.now();
  const staleToken = role!.updated_at as string;

  // First edit with the CURRENT token succeeds (and bumps updated_at).
  const r1 = await request.patch(`/api/staff/admin/roles/${role!.id}`, { headers: H(`ol1-${u}`), data: { description: `v1-${u}`, expected_updated_at: staleToken } });
  expect(r1.ok(), "first edit with a valid token succeeds").toBe(true);

  // Second edit with the now-STALE token is rejected (the record changed under it).
  const r2 = await request.patch(`/api/staff/admin/roles/${role!.id}`, { headers: H(`ol2-${u}`), data: { description: `v2-${u}`, expected_updated_at: staleToken } });
  expect(r2.status(), "stale token -> 409 conflict").toBe(409);
  const b2 = await r2.json();
  expect(b2.error.code).toBe("CONFLICT");

  // The conflicting (v2) write did NOT land — the record still shows v1.
  const after = (await sb.from("portal_roles").select("description").eq("id", role!.id as string).maybeSingle()).data as { description?: string } | null;
  expect(after?.description, "the stale write was not applied").toBe(`v1-${u}`);
});
