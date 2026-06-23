import type { WorkerJob, WorkerResult } from "../types";

export async function handleResultsGenerateBatch(job: WorkerJob): Promise<WorkerResult> {
  // TODO: implement results worker through source-module service.
  // Required: reload record, check idempotency, check feature flags,
  // write audit/job events, avoid sensitive logs.
  void job;
  return { ok: true, output_entity_id: "results_placeholder" };
}
