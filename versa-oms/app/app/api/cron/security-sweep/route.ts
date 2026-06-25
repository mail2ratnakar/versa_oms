// WF-015 hardening (3/3) — scheduled security sweep (FR-SECURITY-SWEEP-2026-0029). Runs the audit-integrity
// verify + permission-drift scan automatically (no human needed), opening incidents on tamper/high-risk
// drift. Triggered by Vercel Cron (Authorization: Bearer CRON_SECRET); dev-auth is accepted locally.
import { NextRequest, NextResponse } from "next/server";
import { enqueueJob, drainJobs } from "@/server/jobs/runner";
import { devAuthAllowed } from "@/server/auth/actor";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { SYSTEM_ACTOR } from "@/server/auth/actor";

const JOBS = ["security.audit_hash_verify", "security.permission_drift_scan", "security.suspicious_login_scan"];

async function handle() {
  for (const jobType of JOBS) enqueueJob(jobType, { triggered_by: "cron" });
  const drained = await drainJobs();
  const ran = drained.runs.filter((r) => JOBS.includes(r.jobType));
  await createAuditEvent({ sourceModule: "security_audit_console", action: "security_sweep", actor: SYSTEM_ACTOR, entityType: "job_runs", entityId: "sweep", reason: `ran ${ran.length} security sweep job(s)` });
  return { ok: true, ran };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorized = (secret && request.headers.get("authorization") === `Bearer ${secret}`) || devAuthAllowed();
  if (!authorized) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "cron secret required" } }, { status: 401 });
  return NextResponse.json(await handle());
}

// Also accept POST (manual trigger from internal tooling).
export const POST = GET;
