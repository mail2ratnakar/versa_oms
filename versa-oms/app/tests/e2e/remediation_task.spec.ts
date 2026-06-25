import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// FR-REMEDIATION-TASK-2026-0036 — a high-risk permission-drift finding creates a tracked remediation
// work_task and advances the finding to remediation_task_created. Fixture: seed_chain3.sql (E2E-DRIFT staff
// on a deprecated role + SEC-REMEDIATION queue).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("a high-risk drift finding creates a remediation task + advances the finding (FR-REMEDIATION-TASK-2026-0036)", async ({ request }) => {
  const sb = admin();
  const staff = (await sb.from("staff_profiles").select("id").eq("staff_code", "E2E-DRIFT").maybeSingle()).data as { id?: string } | null;
  const queue = (await sb.from("task_queues").select("id").eq("queue_code", "SEC-REMEDIATION").maybeSingle()).data as { id?: string } | null;
  test.skip(!staff?.id || !queue?.id, "run seed_chain3.sql (drift fixture + SEC-REMEDIATION queue)");

  const d = (await (await request.post("/api/staff/security-audit/drift-scan", { headers: { "content-type": "application/json", "x-idempotency-key": `rt-${Date.now()}` }, data: {} })).json()).data;
  expect(d.remediation_tasks, "at least one remediation task").toBeGreaterThanOrEqual(1);

  const finding = (await sb.from("permission_drift_findings").select("id, finding_status").eq("role_or_permission_ref", "legacy_admin").eq("staff_user_id", staff!.id as string).maybeSingle()).data as { id?: string; finding_status?: string } | null;
  expect(finding?.finding_status, "finding advanced to remediation_task_created").toBe("remediation_task_created");

  const task = (await sb.from("work_tasks").select("task_type, priority, task_status").eq("source_entity_id", finding!.id as string).eq("task_type", "security_review").maybeSingle()).data as { task_type?: string; priority?: string; task_status?: string } | null;
  expect(task?.task_type, "a security_review remediation task exists for the finding").toBe("security_review");
  expect(task?.priority).toBe("high");
});
