import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Negative pack GLOBAL-RBAC-003 / WF-012-NEG-002 — the last active super admin cannot be suspended.
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("the last active super admin cannot be suspended (GLOBAL-RBAC-003 / WF-012-NEG-002)", async ({ request }) => {
  const sb = admin();
  // The seeded SYSTEM staff is super_admin. Confirm it is active and the only active super_admin.
  const sys = (await sb.from("staff_profiles").select("id, staff_status, primary_role").eq("staff_code", "STAFF-SYSTEM").maybeSingle()).data as { id?: string; staff_status?: string; primary_role?: string } | null;
  const activeSupers = (await sb.from("staff_profiles").select("id", { count: "exact", head: true }).eq("primary_role", "super_admin").eq("staff_status", "active").is("archived_at", null)).count ?? 0;
  test.skip(!sys?.id || sys.staff_status !== "active" || sys.primary_role !== "super_admin" || activeSupers !== 1, "needs exactly one active super_admin (SYSTEM) for this guard test");

  const res = await request.post(`/api/staff/admin/users/${sys!.id}/actions/suspend`, {
    headers: { "content-type": "application/json", "x-idempotency-key": `susp-${Date.now()}` },
    data: { reason: "negative test" },
  });
  expect(res.ok(), "suspend of the last super admin is rejected").toBe(false);
  const body = await res.json();
  expect(JSON.stringify(body).toLowerCase(), "blocked by the super-admin guard").toContain("super admin");

  // The system super admin remains ACTIVE — it was not suspended.
  const after = (await sb.from("staff_profiles").select("staff_status").eq("id", sys!.id as string).maybeSingle()).data as { staff_status?: string } | null;
  expect(after?.staff_status, "system super admin still active").toBe("active");
});
