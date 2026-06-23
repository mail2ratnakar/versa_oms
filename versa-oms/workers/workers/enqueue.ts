import crypto from "node:crypto";
import type { WorkerJob } from "./types";

export function createIdempotencyKey(parts: string[]) {
  return parts.join(":");
}

export function hashPayload(payload: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function enqueueJob(input: {
  job_type: string;
  queue_id: string;
  owner_module: string;
  risk: "low" | "medium" | "high" | "critical";
  payload: Record<string, unknown>;
  idempotency_key: string;
  max_attempts: number;
}): Promise<WorkerJob> {
  return {
    job_id: crypto.randomUUID(),
    job_type: input.job_type,
    queue_id: input.queue_id,
    owner_module: input.owner_module,
    risk: input.risk,
    payload: input.payload,
    payload_hash: hashPayload(input.payload),
    idempotency_key: input.idempotency_key,
    status: "queued",
    attempt_count: 0,
    max_attempts: input.max_attempts,
    created_at: new Date().toISOString()
  };
}
