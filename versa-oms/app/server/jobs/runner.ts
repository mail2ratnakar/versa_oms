import { JOB_REGISTRY, QUEUE_POLICY } from "@/server/jobs/registry.generated";
import { getHandler } from "@/server/jobs/handlers";
import type { JobRun } from "@/server/jobs/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * In-process job runner with idempotency, bounded retries and dead-letter,
 * driven by the generated JOB_REGISTRY + QUEUE_POLICY. Persists each run to the
 * `job_runs` table when a database is available (no-op fallback otherwise).
 * This is the orchestration layer that fires cross-module automations BEYOND a
 * single record's status transition.
 */
const runs: JobRun[] = [];
const byIdem = new Map<string, JobRun>();

const idemId = (jobType: string, key: string) => `${jobType}::${key}`;

export function enqueueJob(jobType: string, payload: Record<string, unknown>, idempotencyKey?: string): JobRun {
  const def = JOB_REGISTRY[jobType];
  const queueId = def?.queueId ?? "default";
  const key = idempotencyKey ?? `${jobType}:${crypto.randomUUID()}`;
  const k = idemId(jobType, key);

  const existing = byIdem.get(k);
  if (existing) return existing; // idempotent: same job + key already enqueued/done

  const run: JobRun = {
    id: crypto.randomUUID(),
    jobType,
    queueId,
    payload,
    idempotencyKey: key,
    status: "queued",
    attempts: 0,
    error: null,
    result: null,
  };
  runs.push(run);
  byIdem.set(k, run);
  return run;
}

async function persist(run: JobRun): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("job_runs").upsert(
      {
        id: run.id,
        job_type: run.jobType,
        queue_id: run.queueId,
        payload: run.payload,
        idempotency_key: run.idempotencyKey,
        status: run.status,
        attempts: run.attempts,
        error: run.error,
        result: run.result as Record<string, unknown> | null,
      },
      { onConflict: "id" }
    );
  } catch {
    // no DB locally — in-memory state is the source of truth.
  }
}

export async function drainJobs(limit = 50): Promise<{
  processed: number;
  runs: Array<{ id: string; jobType: string; status: string; attempts: number; error: string | null }>;
}> {
  const due = runs.filter((j) => j.status === "queued").slice(0, limit);
  for (const run of due) {
    run.status = "running";
    let ok = false;
    while (run.attempts < QUEUE_POLICY.maxAttempts && !ok) {
      run.attempts++;
      try {
        const handler = getHandler(run.jobType);
        run.result = await handler(run.payload, { jobType: run.jobType, jobId: run.id });
        run.status = "succeeded";
        run.error = null;
        ok = true;
      } catch (e) {
        run.error = e instanceof Error ? e.message : String(e);
        if (run.attempts >= QUEUE_POLICY.maxAttempts) {
          run.status = "dead_letter";
        }
      }
    }
    await persist(run);
  }
  return {
    processed: due.length,
    runs: due.map((r) => ({ id: r.id, jobType: r.jobType, status: r.status, attempts: r.attempts, error: r.error })),
  };
}

export function listJobRuns(): JobRun[] {
  return [...runs];
}

/** Test helper: clear the in-memory queue. */
export function resetJobs(): void {
  runs.length = 0;
  byIdem.clear();
}
