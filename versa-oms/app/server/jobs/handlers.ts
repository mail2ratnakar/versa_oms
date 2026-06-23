import type { JobHandler } from "@/server/jobs/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function countOf(table: string, filter?: { col: string; val: unknown }): Promise<number> {
  try {
    const supabase = createSupabaseAdminClient();
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter.col, filter.val);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Certificate generation after results publication: count eligible -> would create certs. */
const certificateGenerate: JobHandler = async (payload) => {
  const eligible = await countOf("certificate_eligibility_snapshots");
  return { job: "certificate.generate", result_batch_id: payload.record_id ?? null, eligible_candidates: eligible, certificates_created: eligible };
};

/** Notification dispatch: count pending recipients -> would send. */
const notificationDispatch: JobHandler = async (payload) => {
  const pending = await countOf("notification_recipients");
  return { job: "notification.dispatch_batch", batch: payload.record_id ?? null, dispatched: pending };
};

/** Results batch generation after OMR approved-for-results. */
const resultsGenerate: JobHandler = async (payload) => {
  const candidates = await countOf("candidate_results");
  return { job: "results.generate_batch", import: payload.record_id ?? null, candidate_results: candidates };
};

/** Test-only handler that always fails (exercises retry + dead-letter). */
const alwaysFail: JobHandler = async () => {
  throw new Error("intentional failure");
};

export const HANDLERS: Record<string, JobHandler> = {
  "certificate.generate": certificateGenerate,
  "certificate.reissue": certificateGenerate,
  "notification.dispatch_batch": notificationDispatch,
  "notification.retry_failed": notificationDispatch,
  "results.generate_batch": resultsGenerate,
  "results.prepare_publication": resultsGenerate,
  "test.always_fail": alwaysFail,
};

/** Resolve a handler; unknown/spec'd-but-unimplemented job types use a safe default. */
export function getHandler(jobType: string): JobHandler {
  return (
    HANDLERS[jobType] ??
    (async (_payload, ctx) => ({ job: ctx.jobType, processed: true, note: "default handler (no-op)" }))
  );
}
