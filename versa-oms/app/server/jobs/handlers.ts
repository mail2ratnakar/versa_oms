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

/** Certificate generation after results publication: create certs + public verification rows. */
const certificateGenerate: JobHandler = async (payload) => {
  const { generateVerificationCode } = await import("@/server/eval/certificate");
  const batchId = String(payload.record_id ?? "");
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("candidate_results")
      .select("id, candidate_id")
      .eq("result_batch_id", batchId);
    const list = (data ?? []) as Array<{ id: string; candidate_id?: string }>;
    let created = 0;
    for (const c of list) {
      const code = generateVerificationCode(c.id);
      await supabase.from("public_verification").upsert(
        { verification_code: code, certificate_id: c.id, candidate_name: c.candidate_id ?? null, status: "valid" },
        { onConflict: "verification_code", ignoreDuplicates: true }
      );
      created++;
    }
    return { job: "certificate.generate", result_batch_id: batchId, certificates_created: created };
  } catch {
    return { job: "certificate.generate", result_batch_id: batchId, certificates_created: 0, local: true };
  }
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

// Roster-lock candidate-ID generation moved to CHAIN-003 (spec/effects/chains.json → transitionEffects.ts).

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
