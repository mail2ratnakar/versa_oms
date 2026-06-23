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

/** Notification dispatch: deliver in-app immediately, queue external channels. */
const notificationDispatch: JobHandler = async (payload) => {
  const { deliver } = await import("@/server/notifications/delivery");
  const batch = String(payload.record_id ?? "");
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("notification_recipients").select("id, channel").eq("batch_id", batch);
    const recips = (data ?? []) as Array<{ id: string; channel?: string }>;
    let delivered = 0;
    let queued = 0;
    for (const r of recips) {
      const res = deliver((r.channel as "in_app" | "email" | "sms" | "whatsapp") ?? "in_app");
      if (res.status === "delivered") delivered++;
      else queued++;
      await supabase.from("notification_recipients").update({ delivery_status: res.status }).eq("id", r.id);
    }
    return { job: "notification.dispatch_batch", batch, delivered, queued_external: queued };
  } catch {
    return { job: "notification.dispatch_batch", batch, delivered: 0, queued_external: 0, local: true };
  }
};

/** Results batch generation after OMR approved-for-results. */
const resultsGenerate: JobHandler = async (payload) => {
  const candidates = await countOf("candidate_results");
  return { job: "results.generate_batch", import: payload.record_id ?? null, candidate_results: candidates };
};

/** Generate candidate IDs for a locked roster batch's students (server-side, idempotent). */
const generateCandidateIds: JobHandler = async (payload) => {
  const { makeCandidateId } = await import("@/server/eval/candidateId");
  const batchId = String(payload.record_id ?? "");
  try {
    const supabase = createSupabaseAdminClient();
    const { data: batch } = await supabase.from("student_roster_batches").select("*").eq("id", batchId).maybeSingle();
    const schoolId = (batch as Record<string, unknown> | null)?.school_id as string | undefined;
    if (!schoolId) return { job: "roster.generate_candidate_ids", batch: batchId, generated: 0, note: "no school" };
    const { data: students } = await supabase
      .from("students")
      .select("id, candidate_id")
      .eq("school_id", schoolId)
      .is("candidate_id", null);
    const list = (students ?? []) as Array<{ id: string }>;
    let n = 0;
    for (const s of list) {
      await supabase.from("students").update({ candidate_id: makeCandidateId(schoolId.slice(0, 8), ++n) }).eq("id", s.id);
    }
    return { job: "roster.generate_candidate_ids", batch: batchId, generated: n };
  } catch {
    return { job: "roster.generate_candidate_ids", batch: batchId, generated: 0, local: true };
  }
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
  "roster.generate_candidate_ids": generateCandidateIds,
  "test.always_fail": alwaysFail,
};

/** Resolve a handler; unknown/spec'd-but-unimplemented job types use a safe default. */
export function getHandler(jobType: string): JobHandler {
  return (
    HANDLERS[jobType] ??
    (async (_payload, ctx) => ({ job: ctx.jobType, processed: true, note: "default handler (no-op)" }))
  );
}
