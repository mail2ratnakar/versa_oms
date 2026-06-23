import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { listJobRuns } from "@/server/jobs/runner";
import { ok, meta } from "@/server/http/envelope";

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, "task_work_queue", "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const runs = listJobRuns().map((r) => ({
    id: r.id,
    job_type: r.jobType,
    queue_id: r.queueId,
    status: r.status,
    attempts: r.attempts,
    error: r.error,
  }));
  return NextResponse.json(ok({ items: runs, pagination: { page: 1, page_size: runs.length, total_count: runs.length, has_next: false, next_cursor: null } }, meta(guard.requestId, "task_work_queue")));
}
