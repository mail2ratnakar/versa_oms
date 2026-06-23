import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { drainJobs } from "@/server/jobs/runner";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, meta } from "@/server/http/envelope";

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "task_work_queue", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const result = await drainJobs();
  await createAuditEvent({
    sourceModule: "task_work_queue",
    action: "drain_jobs",
    actor: guard.actor,
    entityType: "job_runs",
    entityId: "queue",
    reason: `processed ${result.processed} jobs`,
  });
  return NextResponse.json(ok(result, meta(guard.requestId, "task_work_queue")));
}
